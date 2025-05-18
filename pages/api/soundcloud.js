import { redis } from '../../lib/redis';

let accessTokenCache = {
  token: null,
  expiresAt: null,
};

export default async function handler(req, res) {
  const { SC_CLIENT_ID, SC_CLIENT_SECRET } = process.env;
  const cacheKey = 'soundcloud:tracks';

  if (!SC_CLIENT_ID || !SC_CLIENT_SECRET) {
    return res.status(500).json({ error: 'Missing SoundCloud API credentials' });
  }

  try {
    // ✅ Try cached result from Upstash Redis
    const cachedTracks = await redis.get(cacheKey);
    if (cachedTracks) {
      console.log('✅ Using cached SoundCloud data');
      return res.status(200).json(cachedTracks);
    }

    // ✅ Refresh token if expired or missing
    const now = Date.now();
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
        console.error('❌ No access token:', tokenData);
        return res.status(429).json({ error: 'Rate limited by SoundCloud' });
      }

      accessTokenCache.token = tokenData.access_token;
      accessTokenCache.expiresAt = now + tokenData.expires_in * 1000;
    }

    const accessToken = accessTokenCache.token;
    const userId = '52603176';

    const tracksRes = await fetch(`https://api.soundcloud.com/users/${userId}/tracks`, {
      headers: {
        Authorization: `OAuth ${accessToken}`,
      },
    });

    const tracks = await tracksRes.json();

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

    // ✅ Store in Redis cache for 1 hour
    await redis.set(cacheKey, simplified, { ex: 3600 });

    return res.status(200).json(simplified);
  } catch (err) {
    console.error('❌ API error:', err);
    return res.status(500).json({ error: 'Server error fetching SoundCloud tracks' });
  }
}
