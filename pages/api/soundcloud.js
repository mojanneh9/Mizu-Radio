export default async function handler(req, res) {
    const { SC_CLIENT_ID, SC_CLIENT_SECRET } = process.env;
  
    // ✅ Log credentials presence (not full values)
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
      console.log('[DEBUG] Token response:', tokenData);
  
      const accessToken = tokenData.access_token;
      if (!accessToken) {
        console.error('❌ No access token returned from SoundCloud');
        return res.status(401).json({ error: 'Failed to authenticate with SoundCloud' });
      }
  
      // 2. Resolve the user
      const profileRes = await fetch(
        'https://api.soundcloud.com/resolve?url=https://soundcloud.com/mos-path',
        {
          headers: {
            Authorization: `OAuth ${accessToken}`,
          },
        }
      );
  
      const user = await profileRes.json();
      console.log('[DEBUG] Resolved user:', user);
  
      if (!user.id) {
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
      console.log('[DEBUG] Fetched tracks:', Array.isArray(tracks) ? `${tracks.length} found` : tracks);
  
      if (!Array.isArray(tracks)) {
        return res.status(500).json({ error: 'Unexpected track data format from SoundCloud' });
      }
  
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