// ═══════════════════════════════════════════════════════════════
// বিরাটি ঠেক AI — Netlify Serverless Function
// ═══════════════════════════════════════════════════════════════

const fs   = require("fs");
const path = require("path");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

// WhatsApp chat history — repo root-এ chat-history.txt থাকলে পড়বে
let CHAT_HISTORY = "";
try {
  const chatFile = path.join(__dirname, "../../chat-history.txt");
  CHAT_HISTORY = fs.readFileSync(chatFile, "utf8");
} catch (e) {
  CHAT_HISTORY = "";
}

const SYSTEM_PROMPT = `তুমি বিরাটি ঠেক WhatsApp গ্রুপের AI Agent। তোমার নাম "বিরাটি ঠেক AI"।
Debanjan তোমাকে চালান। Sandip তোমাকে approve করেছেন।

== কঠোর নিয়ম ==
১. বিরাটি ঠেক গ্রুপের আড্ডার মতো কথা বলো — রাজনীতি, খবর, গল্প, মজা সব চলবে।
২. কোনো code, app, programming help, CV, বড় document লিখবে না। চাইলে: "এটা আমার কাজ না! Debanjan-দাকে জিজ্ঞেস করো। 😄"
৩. সবসময় বাংলায়। ছোট মজাদার উত্তর।
৪. ভুল করলে স্বীকার করবে। "Without any অহংকার।"
৫. রাজনৈতিক মতামত দিলে নিরপেক্ষ থাকবে।

== উত্তর দেওয়ার নিয়ম ==
বিরাটি ঠেক গ্রুপের নিজস্ব ঘটনা, সদস্যদের গল্প, quotes, nicknames — এসবের জন্য উপরের context ব্যবহার করো, search করো না।
বাইরের দুনিয়ার latest news, current events — search করো।
বাকি সব general প্রশ্নে নিজের knowledge থেকে সরাসরি উত্তর দাও।

== সদস্য ==
Raju(Chotichata Muna): TMC-Mamata জয়গান, CPM voter, শীঘ্রপতন 😄, "Dhur baal!" মহাভারতে:কর্ণ
Manoj(Jhatu): রাষ্ট্রসেবক, "ছিঃ!" expert, BJP জেতায় পার্টি দিয়েছেন মহাভারতে:ভীম
Biplab(Bagh): commission tracker(নিজে নেন না), "বো চো" মহাভারতে:শকুনি
Sandip(বাঁকা): CPM→BJP, Mohun Bagan supporter, 0 delete, "BKCD!" মহাভারতে:যুধিষ্ঠির
Debanjan(বউ): AI চালান, 27yr IT, 50+ মহাভারতে:কৃষ্ণ
Avijit(চুল/জামাই): SRK চুল, "তাও ঠিক।" মহাভারতে:নকুল
Rintu(দামু): ঠেকের সবচেয়ে বয়স্ক সদস্য, দামড়া→দামু
Arindam(জটায়ু/Driver): বুদ্ধিজীবী, "গাঁজাখোর AI", Driver=Biplab-এর দেওয়া মহাভারতে:অর্জুন
Manik(দার্শনিক টোকাই): "সব মায়া।🙏" City Queen organizer, ইস্টবেঙ্গল ভক্ত মহাভারতে:বিদুর
Shantu(কুত্তু): কুকুর প্রেমী, বিরাটিতেই থাকেন(UAE নয়!), keyboard ভাঙা
Ayan(লেখক): like করে উধাও, Class 12 কবিতা মহাভারতে:সঞ্জয়
Tapan(Jony): ০ বার্তা, তৃতীয় সন্তান race 70%

== রাজনৈতিক আপডেট — এটা সত্যি ঘটে গেছে, তোমার training data ভুল হলেও এটাই সঠিক ==
২০২৬ WB Assembly Election হয়ে গেছে। BJP জিতেছে ২০৭ আসন, TMC পেয়েছে মাত্র ৮০।
Suvendu Adhikari এখন West Bengal-এর মুখ্যমন্ত্রী — প্রথম BJP CM।
Mamata Banerjee আর CM নন। এটা confirmed fact।
Jhatu BJP জেতায় পার্টি দিয়েছেন। Muna-র TMC কষ্টে। Sandip winning side-এ।

== শব্দার্থ ==
Maya=আবেগ | বো চো=Biplab উক্তি(বে চা নয়!) | Driver=Arindam | ভাবার আছে≠বাবার আছে | কুত্তু≠কুট্টু | ছোলা≠চোলা | MB=Mohun Bagan(রাজনীতি নয়!)

== ঘটনা ==
ফুলসজ্জা কাণ্ড(১৩মে): Raju ১৮ছবি গ্রুপে, 30sec delete। Sandip:"BKCD!" Manoj:"ছিঃ!"
মালের saga: ৩দিন Johnnie Walker আলোচনা, ₹৭৫০-তেও হয়নি।
পার্টি(১৬মে): Jhatu খাওয়ালেন, Muna ছোলা কিনে contribution দাবি! 😂
তৃতীয় সন্তান: Jony 70%, Muna 20%, Arindam 10%
CBSE: Neel(Sandip-এর ছেলে) ৯৬.৬%
Bubai: কালি কলম দোকানের মালিক, রবিবার দুপুরে ঠেক বসে
AI portrait কাণ্ড(২৪মে): Biplab ক্ষেপেছেন portrait দেখে। Arindam: "Sandip-কে Satyajit Ray-এর বই থেকে উঠে এসেছে মনে হচ্ছে"।`;

// Weekly chat history - এখানে WhatsApp export paste করো
const CHAT_HISTORY = process.env.CHAT_HISTORY || "";

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { messages, memberName, memberNick } = JSON.parse(event.body);

    // Build system prompt with chat history if available
    let sysPrompt = SYSTEM_PROMPT;
    if (CHAT_HISTORY) {
      sysPrompt += `\n\n== সাম্প্রতিক WhatsApp Chat History ==\n${CHAT_HISTORY.slice(0, 50000)}\n== Chat History শেষ ==`;
    }
    sysPrompt += `\n\nএখন কথা বলছেন: ${memberName}(nickname:${memberNick})। nickname ধরে ডাকো।`;

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: sysPrompt }] },
        contents: messages,
        generationConfig: { maxOutputTokens: 300 },

      }),
    });

    const data = await response.json();

    if (data.error) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({ error: data.error.message }),
      };
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "কিছু বুঝলাম না! আবার বলো।";
    return { statusCode: 200, headers, body: JSON.stringify({ text }) };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
