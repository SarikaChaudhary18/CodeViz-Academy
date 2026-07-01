const axios = require('axios');

const YT_API_BASE = 'https://www.googleapis.com/youtube/v3';

// ── Parse ISO 8601 duration (PT1H4M33S → "1:04:33" or "4:33") ─────────────────
function parseDuration(iso) {
  if (!iso) return '0:00';
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  const h = parseInt(match[1] || 0);
  const m = parseInt(match[2] || 0);
  const s = parseInt(match[3] || 0);
  if (h > 0) {
    return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  return `${m}:${String(s).padStart(2,'0')}`;
}

// ── Extract playlist ID from any YouTube URL ──────────────────────────────────
function extractPlaylistId(url) {
  const match = url.match(/[?&]list=([^&]+)/);
  return match ? match[1] : null;
}

// ── Extract video ID from youtu.be or watch URL ───────────────────────────────
function extractVideoId(url) {
  // youtu.be/VIDEO_ID
  let match = url.match(/youtu\.be\/([^?&]+)/);
  if (match) return match[1];
  // youtube.com/watch?v=VIDEO_ID
  match = url.match(/[?&]v=([^&]+)/);
  if (match) return match[1];
  return null;
}

// ── Fetch all videos from a playlist (handles pagination) ─────────────────────
async function fetchPlaylistItems(playlistId, apiKey) {
  let items = [];
  let pageToken = null;

  do {
    const params = {
      part: 'snippet,contentDetails',
      playlistId,
      maxResults: 50,
      key: apiKey,
    };
    if (pageToken) params.pageToken = pageToken;

    const res = await axios.get(`${YT_API_BASE}/playlistItems`, { params });
    const data = res.data;
    items = items.concat(data.items || []);
    pageToken = data.nextPageToken || null;
  } while (pageToken);

  return items;
}

// ── Fetch video details in batches of 50 ─────────────────────────────────────
async function fetchVideoDetails(videoIds, apiKey) {
  const details = {};
  const chunks = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    chunks.push(videoIds.slice(i, i + 50));
  }

  for (const chunk of chunks) {
    const res = await axios.get(`${YT_API_BASE}/videos`, {
      params: { part: 'contentDetails,snippet', id: chunk.join(','), key: apiKey },
    });
    for (const item of (res.data.items || [])) {
      details[item.id] = {
        duration: parseDuration(item.contentDetails.duration),
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
        title: item.snippet.title,
      };
    }
  }
  return details;
}

// ── Main: fetch a full playlist → structured course object ────────────────────
async function fetchPlaylistAsCourse(url, apiKey, overrides = {}) {
  const playlistId = extractPlaylistId(url);

  if (!playlistId) {
    // Single video URL — treat as a 1-video course
    const videoId = extractVideoId(url);
    if (!videoId) throw new Error(`Cannot extract playlist or video ID from: ${url}`);

    const details = await fetchVideoDetails([videoId], apiKey);
    const vid = details[videoId];
    if (!vid) throw new Error(`Video not found: ${videoId}`);

    return {
      title:              overrides.title       || vid.title,
      category:           overrides.category    || 'Development',
      difficulty:         overrides.difficulty  || 'Medium',
      instructor:         overrides.instructor  || 'YouTube Creator',
      description:        overrides.description || vid.title,
      youtubePlaylistUrl: url,
      playlistId:         videoId,
      thumbnail:          vid.thumbnail,
      channelTitle:       overrides.instructor  || '',
      lessonsCount:       1,
      duration:           vid.duration,
      videos: [{
        videoId,
        title:    vid.title,
        duration: vid.duration,
        thumbnail: vid.thumbnail,
        position: 0,
      }],
    };
  }

  // Step 1: Playlist metadata
  const playlistRes = await axios.get(`${YT_API_BASE}/playlists`, {
    params: { part: 'snippet', id: playlistId, key: apiKey },
  });
  const pl = playlistRes.data.items?.[0]?.snippet;
  if (!pl) throw new Error(`Playlist not found: ${playlistId}`);

  const channelTitle = pl.channelTitle || '';
  const plTitle      = pl.title || '';
  const plDesc       = pl.description || plTitle;
  const plThumb      = pl.thumbnails?.high?.url || pl.thumbnails?.medium?.url || pl.thumbnails?.default?.url || '';

  // Step 2: All playlist items
  const items = await fetchPlaylistItems(playlistId, apiKey);

  // Filter out deleted/private videos
  const validItems = items.filter(i =>
    i.snippet.title !== 'Deleted video' &&
    i.snippet.title !== 'Private video' &&
    i.snippet.resourceId?.videoId
  );

  const videoIds = validItems.map(i => i.snippet.resourceId.videoId);

  // Step 3: Video details (duration + thumbnail per video)
  const details = await fetchVideoDetails(videoIds, apiKey);

  // Step 4: Build video list
  const videos = validItems.map((item, idx) => {
    const vid = details[item.snippet.resourceId.videoId] || {};
    return {
      videoId:  item.snippet.resourceId.videoId,
      title:    item.snippet.title,
      duration: vid.duration || '0:00',
      thumbnail: vid.thumbnail || item.snippet.thumbnails?.medium?.url || '',
      position: item.snippet.position ?? idx,
    };
  }).sort((a, b) => a.position - b.position);

  // Step 5: Compute total duration string
  const totalSeconds = videos.reduce((sum, v) => {
    const parts = v.duration.split(':').map(Number);
    if (parts.length === 3) return sum + parts[0]*3600 + parts[1]*60 + parts[2];
    if (parts.length === 2) return sum + parts[0]*60 + parts[1];
    return sum;
  }, 0);
  const th = Math.floor(totalSeconds / 3600);
  const tm = Math.floor((totalSeconds % 3600) / 60);
  const totalDuration = th > 0 ? `${th}h ${tm}m` : `${tm}m`;

  return {
    title:              overrides.title       || plTitle,
    category:           overrides.category    || 'Development',
    difficulty:         overrides.difficulty  || 'Medium',
    instructor:         overrides.instructor  || channelTitle,
    description:        overrides.description || plDesc.slice(0, 300) || plTitle,
    youtubePlaylistUrl: `https://www.youtube.com/playlist?list=${playlistId}`,
    playlistId,
    thumbnail:          plThumb,
    channelTitle,
    lessonsCount:       videos.length,
    duration:           totalDuration,
    videos,
  };
}

module.exports = { fetchPlaylistAsCourse, extractPlaylistId, extractVideoId };
