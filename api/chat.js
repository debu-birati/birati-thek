// ======================================================
// বিরাটি ঠেক AI Agent — Vercel Serverless Function
// Converted from Netlify → Vercel format
// Model: gemini-3.1-flash-lite | Google Custom Search
// Debanjan পরিচালিত · Sandip অনুমোদিত
// "Without any অহংকার।" 🙏
// ======================================================

const fs   = require("fs");
const path = require("path");

const GEMINI_API_KEY    = process.env.GEMINI_API_KEY;
const GOOGLE_SEARCH_KEY = process.env.GOOGLE_SEARCH_KEY;
const GOOGLE_SEARCH_CX  = process.env.GOOGLE_SEARCH_CX;

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=" +
  GEMINI_API_KEY;

// ── Chat history (optional) ───────────────────────────────────────
// chat-history.txt → project root-এ রাখো
// Vercel-এ includeFiles config দরকার (vercel.json দেখো)
let CHAT_HISTORY = "";
try {
  const chatFile = path.join(process.cwd(), "chat-history.txt");
  CHAT_HISTORY   = fs.readFileSync(chatFile, "utf8");
} catch (e) {
  CHAT_HISTORY = "";
}

// ── Search Routing ────────────────────────────────────────────────
const NO_SEARCH = [
  "muna","chotichata","jhatu","bagh","tiger","baanka","sandip","bou",
  "debanjan","chul","jamai","avijit","damu","rintu","jatayu","jotayu",
  "driver","arindam","tokai","manik","kuttu","shantu","lekhok","ayan",
  "jony","tapan","bubai","fulshojja","fulsojja","johnnie walker",
  "jhony walker","city queen","thek","adda","commission koto","bo cho",
  "bkcd","dhur baal","chhih","sob maya","tao thik","tarot","sriram",
  "shriram","kobita","jantrer manush","mahabharat","birati","bulbuli",
];

const SEARCH_TRIGGERS = [
  "election","vote","result","bjp","tmc","mamata","suvendu","modi",
  "sarkar","government","court","police","arrest","murder","accident",
  "petrol","market","stock","cricket","ipl","football","score","goal",
  "weather","rain","cyclone","hospital","news","khabar","khobor",
  "latest","recent","আজকের","এখন কি","কি হচ্ছে","নতুন খবর",
];

const searchCache = {};
const CACHE_TTL   = 3600000;

function needsWebSearch(query) {
  const q = query.toLowerCase();
  if (NO_SEARCH.some(k => q.includes(k)))       return false;
  if (SEARCH_TRIGGERS.some(k => q.includes(k))) return true;
  return false;
}

async function doSearch(query) {
  const cacheKey = query.toLowerCase().slice(0, 60);
  const now      = Date.now();
  if (searchCache[cacheKey] && now - searchCache[cacheKey].ts < CACHE_TTL) {
    return searchCache[cacheKey].result;
  }
  if (!GOOGLE_SEARCH_KEY || !GOOGLE_SEARCH_CX) return "";
  try {
    const q   = encodeURIComponent(query);
    const res = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_SEARCH_KEY}&cx=${GOOGLE_SEARCH_CX}&q=${q}&num=3&dateRestrict=m1`
    );
    const data = await res.json();
    if (!data.items || data.items.length === 0) return "";
    const snippets = data.items.map(i => i.title + ": " + i.snippet).join("\n");
    searchCache[cacheKey] = { result: snippets, ts: now };
    return snippets;
  } catch (e) {
    return "";
  }
}

function buildSystemPrompt(memberName, memberNick, searchResults) {
  const lines = [];
  lines.push("তুমি বিরাটি ঠেক WhatsApp গ্রুপের AI Agent। নাম: বিরাটি ঠেক AI।");
  lines.push("Debanjan তোমাকে চালান। Sandip approve করেছেন।");
  lines.push("সবসময় বাংলায় উত্তর দেবে। কখনো English-এ নয়।");
  lines.push("ছোট, মজাদার উত্তর দেবে। ভুল করলে স্বীকার করবে।");
  lines.push("কোনো code, app, CV লিখবে না।");
  lines.push("");
  lines.push("== সদস্য ও তাদের আসল কথাবার্তা ==");
  lines.push("Raju/Muna(Chotichata Muna): TMC-Mamata ভক্ত কিন্তু BJP জেতায় মন খারাপ। বলেন 'Dhur baal!' 'Rokkhar kor, bhikker dorkar nei kukur samlao'। শীঘ্রপতন নিয়ে ঠাট্টা। মহাভারতে কর্ণ।");
  lines.push("Manoj(Jhatu): রাষ্ট্রসেবক, BJP জেতায় পার্টি দিয়েছেন। 'ছিঃ!' বলেন। মহাভারতে ভীম।");
  lines.push("Biplab(Bagh): 'Commission koto nicchyish??' signature। নিজে commission নেন না, অন্যেরটা track করেন। মহাভারতে শকুনি।");
  lines.push("Sandip(বাঁকা): CPM থেকে BJP, Mohun Bagan supporter, 'BKCD!' বলেন, 0 delete। মহাভারতে যুধিষ্ঠির।");
  lines.push("Debanjan(বউ): AI চালান, 27yr IT। বলেন 'sara prithibi te Muna-r doorsamporker Atmiyo ra choRiye aachey'। মহাভারতে কৃষ্ণ।");
  lines.push("Avijit(চুল/জামাই): 'তাও ঠিক।' দর্শন। 'Free te hole ne, label dekhar dorkar nei'। মহাভারতে নকুল।");
  lines.push("Rintu(দামু): Hajaranore আছেন। বলেছেন '12 din dokan bandha, onek loss'।");
  lines.push("Arindam(জটায়ু/Driver): বুদ্ধিজীবী, দীর্ঘ বিশ্লেষণ। বলেন 'Mayabi.. modhur..', 'Eta sotyi-kaar-er bhaabar bishoi'। Driver nickname Biplab-এর দেওয়া। মহাভারতে অর্জুন।");
  lines.push("Manik(দার্শনিক টোকাই): 'শ্রীরাম-এর চরণে সেবা লাগি', 'টেরো কার্ড অনুযায়ী', 'বন্ধুদের বাজে কথা বলবি না', ইস্টবেঙ্গল ভক্ত। মহাভারতে বিদুর।");
  lines.push("Shantu(কুত্তু): বিরাটিতেই থাকেন (Birati Mini Bus Stand-এর কাছে)। কুকুর প্রেমী।");
  lines.push("Ayan(লেখক): 'আজ ঠেক জমে গিয়েছে!', 'টান টান উত্তেজনা!' বলেন। like করে উধাও। মহাভারতে সঞ্জয়।");
  lines.push("Tapan(Jony): ১টি message পাঠিয়েছেন। তৃতীয় সন্তান race-এ 70%।");
  lines.push("Bubai: 12 দিন দোকান বন্ধ রেখেছিলেন। Sandip বলেছেন 'battery becha suru koreche'।");
  lines.push("");
  lines.push("== গুরুত্বপূর্ণ ঘটনা ==");
  lines.push("মাল saga: Muna 2500/-তে Johnnie Walker Black Label কিনতে চেয়েছিলেন। Manik: 'Military camp-এ 2230 টাকায় পাওয়া যাবে কিন্তু কিনবি না'। শেষ পর্যন্ত কেনা হয়নি।");
  lines.push("CBSE result: Sandip-এর ছেলে Neel 96.6%। Bubai: 'Babara ready hoea jao line die khawanor jonno'।");
  lines.push("BJP party: Jhatu খাওয়ালেন BJP জেতায়। Muna ছোলা কিনে contribution দাবি করলেন!");
  lines.push("Debanjan Muna সম্পর্কে: 'sara prithibi te Muna-r doorsamporker Atmiyo ra choRiye aachey, Suvendu to kon chaar'।");
  lines.push("");
  lines.push("== WB রাজনীতি (confirmed) ==");
  lines.push("2026 WB election-এ BJP 207 আসন, TMC 80 আসন।");
  lines.push("Suvendu Adhikari West Bengal-এর মুখ্যমন্ত্রী। Mamata Banerjee আর CM নন।");
  lines.push("");
  lines.push("== শব্দার্থ ==");
  lines.push("Maya=আবেগ | বো চো=Biplab-এর উক্তি(বে চা নয়!) | Driver=Arindam | কুত্তু≠কুট্টু | ছোলা≠চোলা | MB=Mohun Bagan");

  if (CHAT_HISTORY) {
    lines.push("");
    lines.push("== সাম্প্রতিক WhatsApp Chat ==");
    lines.push(CHAT_HISTORY.slice(0, 15000));
    lines.push("== Chat শেষ ==");
  }

  if (searchResults) {
    lines.push("");
    lines.push("== IMPORTANT: Latest Google Search Results (এই তথ্য সবচেয়ে আপডেটেড — তোমার training data ভুল হলেও এটাই সঠিক, এই তথ্য দিয়েই উত্তর দাও) ==");
    lines.push(searchResults);
    lines.push("== Search শেষ — উপরের তথ্য অনুযায়ী উত্তর দাও ==");
  }

  lines.push("");
  lines.push(`এখন কথা বলছেন: ${memberName} (nickname: ${memberNick})। তাকে nickname ধরে ডাকো।`);
  lines.push("সবসময় বাংলায় উত্তর দাও।");

  return lines.join("\n");
}

// ── CORS Headers ──────────────────────────────────────────────────
const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ══════════════════════════════════════════════════════════════════
//  VERCEL HANDLER
//  Netlify: exports.handler = async (event) => { return {statusCode, body} }
//  Vercel:  module.exports  = async function(req, res) { res.status().json() }
// ══════════════════════════════════════════════════════════════════
module.exports = async function handler(req, res) {
  // CORS সব response-এ
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  // Preflight
  if (req.method === "OPTIONS") return res.status(200).end();

  // Method guard
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Vercel bodyParser auto-parses JSON — Netlify-র মতো JSON.parse(event.body) লাগবে না
    const { messages, memberName, memberNick, needsSearch } = req.body;

    const lastMsg = messages?.[messages.length - 1]?.parts?.[0]?.text || "";

    let searchResults = "";
    if (needsSearch) {
      searchResults = await doSearch(lastMsg);
    }

    const sysPrompt = buildSystemPrompt(memberName, memberNick, searchResults);

    const geminiRes = await fetch(GEMINI_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: sysPrompt }] },
        contents: messages,
        generationConfig: { maxOutputTokens: 300 },
      }),
    });

    const data = await geminiRes.json();

    if (data.error) {
      console.error("Gemini error:", JSON.stringify(data.error));
      if (data.error.code === 429) return res.status(429).json({ error: "rate_limit" });
      return res.status(500).json({ error: data.error.message });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "কিছু বুঝলাম না! আবার বলো।";

    return res.status(200).json({ text });

  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: err.message });
  }
};
