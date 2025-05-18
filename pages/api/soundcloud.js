export default async function handler(req, res) {
    const { SC_CLIENT_ID, SC_CLIENT_SECRET } = process.env;
  
    console.log('[ENV] SC_CLIENT_ID:', SC_CLIENT_ID ? '✅ Present' : '❌ Missing');
    console.log('[ENV] SC_CLIENT_SECRET:', SC_CLIENT_SECRET ? '✅ Present' : '❌ Missing');
  
    if (!SC_CLIENT_ID || !SC_CLIENT_SECRET) {
      return res.status(500).json({ error: 'Missing SoundCloud API credentials' });
    }
  
    try {
      // 1. Get OAuth token
      const tokenResponse = await fetch('https://api.soundcloud.com/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: SC_CLIENT_ID,
          client_secret: SC_CLIENT_SECRET,
          grant_type: 'client_credentials',
        }),
      });
  
      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;
  
      if (!accessToken) {
        console.error('❌ No access token:', tokenData);
        return res.status(401).json({ error: 'Failed to authenticate with SoundCloud' });
      }
  
      // ✅ Use hardcoded user ID
      const userId = '52603176';
  
      // 2. Fetch tracks directly
      const tracksRes = await fetch(
        `https://api.soundcloud.com/users/${userId}/tracks`,
        {
          headers: {
            Authorization: `OAuth ${accessToken}`,
          },
        }
      );
  
      const tracks = await tracksRes.json();
  
      if (!Array.isArray(tracks)) {
        console.error('❌ Unexpected response from track API:', tracks);
        return res.status(500).json({ error: 'Unexpected track data format from SoundCloud' });
      }
  
      // 3. Return simplified tracks
      const simplified = tracks.map((track) => ({
        id: track.id,
        title: track.title,
        artwork_url: track.artwork_url,
        stream_url: track.stream_url,
      }));
  
      return res.status(200).json(simplified);
    } catch (err) {
      console.error('❌ SoundCloud API error:', err);
      return res.status(500).json({ error: 'Server error while accessing SoundCloud API' });
    }
  }