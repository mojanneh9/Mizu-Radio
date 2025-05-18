// pages/api/soundcloud.js

export default async function handler(req, res) {
    const { SC_CLIENT_ID, SC_CLIENT_SECRET } = process.env;
  
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
  
      // 2. Fetch user profile via resolve
      const profileRes = await fetch(
        'https://api.soundcloud.com/resolve?url=https://soundcloud.com/mos-path',
        {
          headers: {
            Authorization: `OAuth ${accessToken}`,
          },
        }
      );
  
      const user = await profileRes.json();
  
      if (!user.id) {
        console.error('❌ Could not resolve user:', user);
        return res.status(404).json({ error: 'User not found on SoundCloud' });
      }
  
      // 3. Fetch tracks
      const tracksRes = await fetch(
        `https://api.soundcloud.com/users/${user.id}/tracks`,
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
  
      // 4. Return only needed fields (optional: helps reduce frontend size)
      const simplified = tracks.map((track) => ({
        id: track.id,
        title: track.title,
        artwork_url: track.artwork_url,
        stream_url: track.stream_url, // we'll use this to proxy
      }));
  
      return res.status(200).json(simplified);
    } catch (err) {
      console.error('❌ SoundCloud API error:', err);
      return res.status(500).json({ error: 'Server error while accessing SoundCloud API' });
    }
  }