// ======================================================
// বিরাটি ঠেক — Stats API (Upstash Redis)
// GET  /api/stats → stats load
// POST /api/stats → stats save
// ======================================================

const REDIS_URL   = process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN;
const STATS_KEY   = "birati-thek-stats";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

async function redisGet(key) {
  const res = await fetch(`${REDIS_URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
  });
  const data = await res.json();
  return data.result ? JSON.parse(data.result) : null;
}

async function redisSet(key, value) {
  const res = await fetch(`${REDIS_URL}/set/${key}`, {
    method:  "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ value: JSON.stringify(value) })
  });
  return res.ok;
}

module.exports = async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === "OPTIONS") return res.status(200).end();

  // GET → stats load
  if (req.method === "GET") {
    try {
      const stats = await redisGet(STATS_KEY);
      return res.status(200).json(stats || { total: 0, msgs: {} });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // POST → stats save
  if (req.method === "POST") {
    try {
      const { total, msgs } = req.body;
      await redisSet(STATS_KEY, { total, msgs });
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
