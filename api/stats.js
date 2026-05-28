// ======================================================
// বিরাটি ঠেক — Stats API (Upstash Redis REST)
// GET  /api/stats → stats load
// POST /api/stats → stats save
// Upstash REST API: https://upstash.com/docs/redis/features/restapi
// ======================================================

const REDIS_URL   = process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN;
const STATS_KEY   = "birati-thek-stats";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Upstash REST GET: GET /get/{key}
async function redisGet(key) {
  const res = await fetch(`${REDIS_URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
  });
  const data = await res.json();
  // data.result is a JSON string or null
  if (!data.result) return null;
  try { return JSON.parse(data.result); }
  catch { return null; }
}

// Upstash REST SET: POST /set/{key}  body = value as string
async function redisSet(key, value) {
  const res = await fetch(`${REDIS_URL}/set/${key}`, {
    method:  "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(JSON.stringify(value)) // double stringify: outer for body, inner stored as string
  });
  const data = await res.json();
  return data.result === "OK";
}

module.exports = async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === "OPTIONS") return res.status(200).end();

  // GET → stats load
  if (req.method === "GET") {
    try {
      if (!REDIS_URL || !REDIS_TOKEN) {
        return res.status(200).json({ visits: 0, total: 0, msgs: {} });
      }
      const stats = await redisGet(STATS_KEY);
      return res.status(200).json(stats || { visits: 0, total: 0, msgs: {} });
    } catch (e) {
      console.error("Stats GET error:", e.message);
      return res.status(200).json({ visits: 0, total: 0, msgs: {} });
    }
  }

  // POST → stats save
  if (req.method === "POST") {
    try {
      if (!REDIS_URL || !REDIS_TOKEN) {
        return res.status(200).json({ ok: true });
      }
      const { visits, total, msgs } = req.body;
      await redisSet(STATS_KEY, { visits, total, msgs });
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error("Stats POST error:", e.message);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
