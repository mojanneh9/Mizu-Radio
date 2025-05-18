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
          grant_type: 'client_credentials'
        })
      });
  
      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;
  
      if (!accessToken) {
        return res.status(401).json({ error: 'Failed to authenticate with SoundCloud' });
      }
  
      // 2. Fetch user profile via resolve endpoint
      const profileRes = await fetch(
        'https://api.soundcloud.com/resolve?url=https://soundcloud.com/mos-path',
        {
          headers: {
            Authorization: `OAuth ${accessToken}`
          }
        }
      );
  
      const user = await profileRes.json();
      if (!user.id) {
        return res.status(404).json({ error: 'User not found on SoundCloud' });
      }
  
      // 3. Fetch user tracks
      const tracksRes = await fetch(
        `https://api.soundcloud.com/users/${user.id}/tracks`,
        {
          headers: {
            Authorization: `OAuth ${accessToken}`
          }
        }
      );
  
      const tracks = await tracksRes.json();
      return res.status(200).json(tracks);
  
    } catch (err) {
      console.error('SoundCloud API error:', err);
      return res.status(500).json({ error: 'Server error while accessing SoundCloud API' });
    }
  }