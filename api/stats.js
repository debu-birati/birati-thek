// ======================================================
// বিরাটি ঠেক — Stats API (Upstash Redis REST)
// Upstash REST API verified format:
// GET  /get/{key}          → read
// POST /set/{key}/{value}  → write (value URL-encoded)
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
  if (!data.result) return null;
  try { return JSON.parse(data.result); }
  catch { return null; }
}

async function redisSet(key, value) {
  // Upstash REST: POST /set/{key}/{value} — value in URL
  const valueStr = encodeURIComponent(JSON.stringify(value));
  const res = await fetch(`${REDIS_URL}/set/${key}/${valueStr}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
  });
  const data = await res.json();
  return data.result === "OK";
}

module.exports = async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

  if (req.method === "OPTIONS") return res.status(200).end();

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

  if (req.method === "POST") {
    try {
      if (!REDIS_URL || !REDIS_TOKEN) {
        return res.status(200).json({ ok: true });
      }
      const ok = await redisSet(STATS_KEY, req.body);
      return res.status(200).json({ ok });
    } catch (e) {
      console.error("Stats POST error:", e.message);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
