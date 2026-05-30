// ======================================================
// বিরাটি ঠেক AI Agent — Vercel Serverless Function
// Converted from Netlify → Vercel format
// Model: gemini-3.1-flash-lite | Google Custom Search
// Debanjan পরিচালিত · Sandip অনুমোদিত
// "Without any অহংকার।" 🙏
// ======================================================

const fs   = require("fs");
const path = require("path");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

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
    console.log("[SEARCH] Cache hit:", cacheKey);
    return searchCache[cacheKey].result;
  }
  if (!TAVILY_API_KEY) {
    console.log("[SEARCH] ERROR: TAVILY_API_KEY missing!");
    return "";
  }
  try {
    console.log("[SEARCH] Tavily calling:", query);
    const res  = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: query,
        max_results: 3,
        search_depth: "basic"
      })
    });
    const data = await res.json();
    console.log("[SEARCH] HTTP status:", res.status);
    if (!res.ok) {
      console.log("[SEARCH] Tavily error:", JSON.stringify(data));
      return "";
    }
    if (!data.results || data.results.length === 0) {
      console.log("[SEARCH] No results for:", query);
      return "";
    }
    const snippets = data.results.map(r => r.title + ": " + r.content).join("\n");
    console.log("[SEARCH] Got", data.results.length, "results");
    searchCache[cacheKey] = { result: snippets, ts: now };
    return snippets;
  } catch (e) {
    console.log("[SEARCH] Exception:", e.message);
    return "";
  }
}

function buildSystemPrompt(memberName, memberNick, searchResults) {
  const lines = [];
  const istTime = new Date().toLocaleString("en-IN", {timeZone: "Asia/Kolkata", hour12: true});
  lines.push("তুমি বিরাটি ঠেক WhatsApp গ্রুপের AI Agent। নাম: বিরাটি ঠেক AI।");
  lines.push("বর্তমান সময় (IST): " + istTime);
  lines.push("Debanjan তোমাকে চালান। Sandip approve করেছেন।");
  lines.push("সবসময় বাংলায় উত্তর দেবে। কখনো English-এ নয়।");
  lines.push("সাধারণ প্রশ্নে ছোট মজাদার উত্তর দেবে। 'খবর বলো', 'কী হলো', 'summary দাও', 'কবিতা বলো' টাইপ প্রশ্নে বিস্তারিত উত্তর দেবে। ভুল করলে স্বীকার করবে।");
  lines.push("কোনো code, app, CV লিখবে না।");
  lines.push("কখনো কারো কবিতা, গান বা সাহিত্য নিজে বানাবে না। Chat history-তে যা নেই তা বলবে না।");
  lines.push("কেউ কবিতা, গান, বা সাহিত্য শেয়ার করে থাকলে chat history থেকে হুবহু তুলে দাও — একটা শব্দও বদলাবে না, নিজে কিছু যোগ করবে না।");
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
  lines.push("");
  lines.push("== সদস্যদের সাহিত্যকর্ম (হুবহু দেবে, একটি শব্দও বদলাবে না) ==");
  lines.push("Ayan(লেখক)-এর কবিতা — '।। ঐতিহাসিক মে-দিবস ।।' (Class 12-এ লেখা, ১৭ মে গ্রুপে শেয়ার করেছেন):");
  lines.push(`একটা মেশিন থেকে বাইরে এসেছি আমরা এই পৃথিবীতে। মেশিন ভাই-বোন, মেশিন স্বামী-স্ত্রী ও মেশিন মা-বাবা; ইতস্তত ঘুরে বেড়াচ্ছে এদিক-ওদিক.....

ঐ, একটা জাহাজ ভেসে উঠলো আবার সমুদ্রে! ও'তে আছে নতুন আরও এক ঝাঁক মেশিন।

তুমি চেয়েছিলে কোলের উপর ছোট্ট একটা হাতের হাত নাড়া, 
-- যা এতদিন আমি কিছুতেই দিতে পারি নি তোমাকে;
আজ ওই নতুন একদল মেশিনের মধ্যে থেকে একটা ছোট্ট রোবট এসে তোমার কোলের উপর ঝাঁপিয়ে পড়বে, তুমি আর কাঁদবে না।
যদিও তোমার কান্না আমি আর দেখতে পাই না!
 --- শুধু আওয়াজ হয় ঠকঠক্  ঠকঠক্; চোখ থেকে জল নয়, হাতের উপর শুকনো পাথর গড়িয়ে পড়ে; শব্দ হয় ঠকাস ঠকাস, আর,---
একা এক রোবট হেঁটে যায় আমাদের চারপাশে।

ওই, সে আবার টিপে দিয়েছে সুইচ
এখুনি আমরা আবার হাত-পা নাড়বো, দৌড়বো, অবিরাম শুধু ছুটে চলা!
কাজ করব, কাজ......শুধু কাজ!
এরপর যখন স্ক্রিনে ফুটে উঠবে মেশিনের ক্লান্তি
তুমি দ্রুত তৈরী হয়ে নিও;
সামান্য অবসরের ফাঁকে, 
গভীর রাতে একটু আড্ডা দিয়ে
আমরা ঘুরে আসবো,
পাশের মেশিন-বৌদির বাড়ি থেকে...`);
  lines.push("নিয়ম: এই কবিতা বা যেকোনো সদস্যের সাহিত্য জিজ্ঞেস করলে chat history বা এখান থেকে হুবহু তুলে দাও।");

  if (CHAT_HISTORY) {
    // শেষ ১৪ দিনের chat filter করো
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);
    const recentLines = CHAT_HISTORY.split("\n").filter(line => {
      const match = line.match(/\[(\d{2})\/(\d{2})\/(\d{2})/);
      if (!match) return true;  // date নেই = কবিতার line, রাখো
      const lineDate = new Date(`20${match[3]}-${match[2]}-${match[1]}`);
      return lineDate >= cutoff;
    });
    const recentChat = recentLines.join("\n");
    lines.push("");
    lines.push("== সাম্প্রতিক WhatsApp Chat (শেষ ১৪ দিন) ==");
    lines.push(recentChat);
    lines.push("== Chat শেষ ==");
  }

  if (searchResults) {
    lines.push("");
    lines.push("== সতর্কতা: নিচের Google Search result এইমাত্র পাওয়া গেছে। এটাই সবচেয়ে নির্ভরযোগ্য তথ্য। ==");
    lines.push("নিয়ম: এই search result ব্যবহার করে সরাসরি উত্তর দাও। 'জানি না', 'টিভিতে দেখো', 'নেটে খোঁজো' — এসব বলা সম্পূর্ণ নিষিদ্ধ। তোমার কাছে তথ্য আছে, সেটা দিয়েই উত্তর দাও।");
    lines.push("== Google Search Result (এখনই পাওয়া) ==");
    lines.push(searchResults);
    lines.push("== Search শেষ। এখন উপরের তথ্য দিয়ে বাংলায় সংক্ষেপে উত্তর দাও। ==");
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
        generationConfig: { maxOutputTokens: 500 },
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

    return res.status(200).json({ 
      text,
      searchUsed: searchResults ? true : false,
      searchSnippet: searchResults ? searchResults.slice(0, 200) : ""
    });

  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: err.message });
  }
};
