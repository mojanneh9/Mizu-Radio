export default async function handler(req, res) {
    const { SC_CLIENT_ID, SC_CLIENT_SECRET } = process.env;
    const { trackUrl } = req.query;
  
    if (!trackUrl) {
      return res.status(400).json({ error: 'Missing track URL' });
    }
  
    try {
      // Get OAuth token
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
  
      // Fetch stream using OAuth header
      const streamRes = await fetch(trackUrl, {
        headers: {
          Authorization: `OAuth ${accessToken}`,
        },
      });
  
      if (!streamRes.ok) {
        return res.status(streamRes.status).json({ error: 'Failed to fetch stream' });
      }
  
      // Stream directly to client
      res.setHeader('Content-Type', 'audio/mpeg');
      streamRes.body.pipe(res);
    } catch (err) {
      console.error('Streaming error:', err);
      res.status(500).json({ error: 'Error fetching stream from SoundCloud' });
    }
  }