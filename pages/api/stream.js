// pages/api/stream.js

export default async function handler(req, res) {
    const { SC_CLIENT_ID, SC_CLIENT_SECRET } = process.env;
    const { trackUrl } = req.query;
  
    if (!trackUrl) {
      return res.status(400).json({ error: 'Missing track URL' });
    }
  
    try {
      // 1. Get OAuth token
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
      const accessToken = tokenData.access_token;
  
      if (!accessToken) {
        return res.status(401).json({ error: 'Unable to authenticate with SoundCloud' });
      }
  
      // 2. Fetch the full track metadata using the `trackUrl`
      const trackRes = await fetch(trackUrl, {
        headers: {
          Authorization: `OAuth ${accessToken}`,
        },
      });
  
      if (!trackRes.ok) {
        return res.status(trackRes.status).json({ error: 'Failed to fetch track metadata' });
      }
  
      const trackData = await trackRes.json();
  
      // 3. Find the MP3 progressive stream URL
      const mp3Stream = trackData?.media?.transcodings?.find(t => t.format.protocol === 'progressive');
  
      if (!mp3Stream) {
        return res.status(404).json({ error: 'MP3 stream not found for this track' });
      }
  
      const streamResolveRes = await fetch(`${mp3Stream.url}?client_id=${SC_CLIENT_ID}`, {
        headers: {
          Authorization: `OAuth ${accessToken}`,
        },
      });
  
      const streamResolveData = await streamResolveRes.json();
      const finalStreamUrl = streamResolveData?.url;
  
      if (!finalStreamUrl) {
        return res.status(500).json({ error: 'Could not resolve final stream URL' });
      }
  
      // 4. Pipe the final MP3 stream to the browser
      const finalStreamRes = await fetch(finalStreamUrl);
  
      if (!finalStreamRes.ok || !finalStreamRes.body) {
        return res.status(finalStreamRes.status).json({ error: 'Error streaming audio' });
      }
  
      res.setHeader('Content-Type', 'audio/mpeg');
      finalStreamRes.body.pipe(res);
    } catch (err) {
      console.error('Streaming error:', err);
      res.status(500).json({ error: 'Error streaming from SoundCloud' });
    }
  }