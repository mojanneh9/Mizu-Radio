import { redis } from '../../lib/redis';

export default async function handler(req, res) {
  const { SC_CLIENT_ID, SC_CLIENT_SECRET } = process.env;
  const userId = '52603176';

  if (!SC_CLIENT_ID || !SC_CLIENT_SECRET) {
    return res.status(500).json({ error: 'Missing SoundCloud credentials' });
  }

  try {
    let accessToken = await redis.get('sc_token');
    const expiresAt = await redis.get('sc_token_expiry');
    const now = Date.now();

    console.log('[Redis] Cached token:', accessToken ? '✅' : '❌');
    console.log('[Redis] Token expiry:', expiresAt);
    console.log('[Now]', now);

    if (!accessToken || now > Number(expiresAt)) {
      console.log('[Redis] Token expired or missing. Fetching new token...');

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
        console.error('❌ No access token:', tokenData);

        // Fallback: try to use expired token if it exists
        const fallbackToken = await redis.get('sc_token');
        if (fallbackToken) {
          console.warn('⚠️ Using possibly expired token as fallback.');
          accessToken = fallbackToken;
        } else {
          return res.status(429).json({ error: 'Rate limited by SoundCloud and no cached token available' });
        }
      } else {
        accessToken = tokenData.access_token;
        await redis.set('sc_token', accessToken);
        await redis.set('sc_token_expiry', now + tokenData.expires_in * 1000);
        console.log('[Redis] Token saved to Redis');
      }
    } else {
      console.log('[Redis] Using cached token');
    }

    const trackRes = await fetch(`https://api.soundcloud.com/users/${userId}/tracks`, {
      headers: {
        Authorization: `OAuth ${accessToken}`,
      },
    });

    const tracks = await trackRes.json();

    if (!Array.isArray(tracks)) {
      console.error('❌ Unexpected tracks format:', tracks);
      return res.status(500).json({ error: 'Invalid track data from SoundCloud' });
    }

    const simplified = tracks.map((track) => ({
      id: track.id,
      title: track.title,
      artwork_url: track.artwork_url,
      stream_url: track.stream_url,
    }));

    return res.status(200).json(simplified);
  } catch (err) {
    console.error('❌ API error:', err);
    return res.status(500).json({ error: 'Server error fetching SoundCloud tracks' });
  }
}