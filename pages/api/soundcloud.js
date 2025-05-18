export default async function handler(req, res) {
    const { SC_CLIENT_ID } = process.env;
  
    console.log('[ENV] SC_CLIENT_ID:', SC_CLIENT_ID ? '✅ Present' : '❌ Missing');
  
    if (!SC_CLIENT_ID) {
      return res.status(500).json({ error: 'Missing SoundCloud client ID' });
    }
  
    try {
      const resolveRes = await fetch(`https://api.soundcloud.com/resolve?url=https://soundcloud.com/mos-path&client_id=${SC_CLIENT_ID}`);
      const user = await resolveRes.json();
  
      if (!user.id) {
        console.error('❌ Could not resolve user:', user);
        return res.status(404).json({ error: 'User not found' });
      }
  
      const tracksRes = await fetch(`https://api.soundcloud.com/users/${user.id}/tracks?client_id=${SC_CLIENT_ID}`);
      const tracks = await tracksRes.json();
  
      if (!Array.isArray(tracks)) {
        console.error('❌ Unexpected response from track API:', tracks);
        return res.status(500).json({ error: 'Unexpected data format' });
      }
  
      const simplified = tracks.map((track) => ({
        id: track.id,
        title: track.title,
        artwork_url: track.artwork_url,
        stream_url: `${track.stream_url}?client_id=${SC_CLIENT_ID}`,
      }));
  
      return res.status(200).json(simplified);
    } catch (err) {
      console.error('❌ API error:', err);
      return res.status(500).json({ error: 'Server error while accessing SoundCloud' });
    }
  }