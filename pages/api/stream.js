let accessTokenCache = {
    token: null,
    expiresAt: null,
  };
  
  export default async function handler(req, res) {
    const { SC_CLIENT_ID, SC_CLIENT_SECRET } = process.env;
    const { trackUrl } = req.query;
  
    if (!trackUrl) {
      return res.status(400).json({ error: 'Missing track URL' });
    }
  
    try {
      const now = Date.now();
  
      // ✅ Use cached token if valid
      if (!accessTokenCache.token || accessTokenCache.expiresAt < now) {
        const tokenRes = await fetch('https://api.soundcloud.com/oauth2/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: SC_CLIENT_ID,
            client_secret: SC_CLIENT_SECRET,
            grant_type: 'client_credentials',
          }),
        });
  
        const tokenData = await tokenRes.json();
  
        if (!tokenData.access_token) {
          console.error('❌ Failed to get access token:', tokenData);
          return res.status(429).json({ error: 'Rate limited or failed to authenticate with SoundCloud' });
        }
  
        accessTokenCache.token = tokenData.access_token;
        accessTokenCache.expiresAt = now + tokenData.expires_in * 1000;
      }
  
      const accessToken = accessTokenCache.token;
  
      // Step 2: Fetch metadata for the track
      const metadataRes = await fetch(trackUrl, {
        headers: { Authorization: `OAuth ${accessToken}` },
      });
  
      if (!metadataRes.ok) {
        return res.status(metadataRes.status).json({ error: 'Failed to fetch track metadata' });
      }
  
      const trackData = await metadataRes.json();
  
      const mp3Stream = trackData?.media?.transcodings?.find(
        (t) => t.format.protocol === 'progressive'
      );
  
      if (!mp3Stream) {
        return res.status(404).json({ error: 'MP3 stream not found for this track' });
      }
  
      const streamRes = await fetch(`${mp3Stream.url}?client_id=${SC_CLIENT_ID}`, {
        headers: { Authorization: `OAuth ${accessToken}` },
      });
  
      const streamData = await streamRes.json();
      const finalStreamUrl = streamData?.url;
  
      if (!finalStreamUrl) {
        return res.status(500).json({ error: 'Could not resolve final stream URL' });
      }
  
      const audioStreamRes = await fetch(finalStreamUrl);
  
      if (!audioStreamRes.ok || !audioStreamRes.body) {
        return res.status(audioStreamRes.status).json({ error: 'Error streaming audio' });
      }
  
      res.setHeader('Content-Type', 'audio/mpeg');
      audioStreamRes.body.pipe(res);
    } catch (err) {
      console.error('Streaming error:', err);
      res.status(500).json({ error: 'Error streaming from SoundCloud' });
    }
  }