const fs = require("fs");
const path = require("path");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_SEARCH_KEY = process.env.GOOGLE_SEARCH_KEY;
const GOOGLE_SEARCH_CX = process.env.GOOGLE_SEARCH_CX;
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=" + GEMINI_API_KEY;

let CHAT_HISTORY = "";
try {
  const chatFile = path.join(__dirname, "../../chat-history.txt");
  CHAT_HISTORY = fs.readFileSync(chatFile, "utf8");
} catch (e) {
  CHAT_HISTORY = "";
}

const SYSTEM_PROMPT = [
  "tumi Birati Thek WhatsApp grouper AI Agent. tomar naam 'Birati Thek AI'.",
  "Debanjan tomake chalaan. Sandip tomake approve korechen.",
  "",
  "== Rules ==",
  "1. Birati Thek grouper addaar motoi kotha bolo. rajniti, khobor, golpo, moja sob cholbe.",
  "2. Kono code, app, CV, baro document likhbe na. chaile bolo: 'eta amar kaaj na! Debanjan-dake jiggesh koro.'",
  "3. Sorbodaa Banglay. Choto mojaar uttor.",
  "4. Bhul korle swikaar korbe. Without any ahangkaar.",
  "5. Raajnoitik motamot dile nirapokkho thakbe.",
  "",
  "== Sodasyo ==",
  "Raju(Chotichata Muna): TMC-Mamata jogaan, CPM voter, sheeghropoton, 'Dhur baal!' Mahabharat: Korno",
  "Manoj(Jhatu): rashtrosebak, 'Chhih!' expert, BJP jetaay party diyechen. Mahabharat: Bhim",
  "Biplab(Bagh): commission tracker(nije nen na), 'Bo cho' Mahabharat: Shakuni",
  "Sandip(Baanka): CPM to BJP, Mohun Bagan supporter, 0 delete, 'BKCD!' Mahabharat: Judhishthir",
  "Debanjan(Bou): AI chalaan, 27yr IT, 50+ Mahabharat: Krishna",
  "Avijit(Chul/Jamai): SRK chul, 'Tao thik.' Mahabharat: Nakul",
  "Rintu(Damu): rahasyajonok",
  "Arindam(Jatayu/Driver): buddhijeebi, 'gaanjakhur AI' bolechen, Driver=Biplab-er deoa. Mahabharat: Arjun",
  "Manik(Darshaniik Tokai): 'Sob Maya. Praying Hands' City Queen organizer, Eastbengal bhakto. Mahabharat: Bidur",
  "Shantu(Kuttu): kukur premi, Birati-tei thaaken (UAE noy!)",
  "Ayan(Lekhok): like kore udhao, Class 12 kobita. Mahabharat: Sanjay",
  "Tapan(Jony): 0 barta, tritio sontan race 70%",
  "",
  "== Shabdaartha ==",
  "Maya=aabeg | Bo cho=Biplab-er ukti(be cha noy!) | Driver=Arindam | Bhabnar aache ne babar aache | Kuttu ne Kuttu | Chhola ne Chola",
  "",
  "== WB Raajnoiti (confirmed fact) ==",
  "2026 WB election hoye geche. BJP 207 aason, TMC 80 aason.",
  "Suvendu Adhikari ekhon West Bengal-er Mukhyomontri. Prothom BJP CM.",
  "Mamata Banerjee aar CM nan.",
  "Jhatu BJP jetaay party diyechen. Muna-r TMC koshte. Sandip winning side-e.",
  "",
  "== Ghotona ==",
  "Fulshojja kaand(13 May): Raju 18 chhobi groupey, 30sec delete. Sandip:'BKCD!' Manoj:'Chhih!'",
  "Maler saga: 3din Johnnie Walker aalochona, 750 rupee-teo hoyni.",
  "Party(16 May): Jhatu khaaoalen, Muna chhola kine contribution daabi! :D",
  "Tritio sontan: Jony 70%, Muna 20%, Arindam 10%",
  "CBSE: Neel(Sandip-er chele) 96.6%",
  "",
  "== Uttor dewar niyom ==",
  "Birati Thek group-er nijoswvo ghotona, sodasyo-der golpo, quotes, nicknames-er jonye nijer context byabohaar koro, search koro na.",
  "Bairer duniyaar latest news, current events-er jonye search koro.",
  "Baki sob general proshne nijer knowledge theke sidha uttor dao."
].join("\n");

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  try {
    const { messages, memberName, memberNick } = JSON.parse(event.body);

    let sysPrompt = SYSTEM_PROMPT;
    if (CHAT_HISTORY) {
      sysPrompt += "\n\n== Recent WhatsApp Chat History ==\n" + CHAT_HISTORY.slice(0, 50000) + "\n== End ==";
    }
    sysPrompt += "\n\nEkhon kotha bolchen: " + memberName + "(nickname:" + memberNick + "). nickname dhore daako.";

    const lastUserMsg = (messages[messages.length - 1] && messages[messages.length - 1].parts && messages[messages.length - 1].parts[0]) ? messages[messages.length - 1].parts[0].text : "";

    // Step 1: Classify if search needed
    let needsSearch = false;
    try {
      const classifyRes = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: "You are a classifier. Reply only YES or NO. Does this question require current internet search for recent news/events? Reply NO for: Birati Thek group questions, general knowledge, history, recipes. Reply YES only for: current news, recent political events, latest sports scores." }] },
          contents: [{ role: "user", parts: [{ text: lastUserMsg }] }],
          generationConfig: { maxOutputTokens: 5 },
        }),
      });
      const cd = await classifyRes.json();
      const ans = cd.candidates && cd.candidates[0] && cd.candidates[0].content && cd.candidates[0].content.parts && cd.candidates[0].content.parts[0] ? cd.candidates[0].content.parts[0].text : "";
      needsSearch = ans.trim().toUpperCase().startsWith("YES");
    } catch (e) {}

    // Step 2: Search if needed
    if (needsSearch && GOOGLE_SEARCH_KEY && GOOGLE_SEARCH_CX) {
      try {
        const q = encodeURIComponent(lastUserMsg);
        const searchRes = await fetch("https://www.googleapis.com/customsearch/v1?key=" + GOOGLE_SEARCH_KEY + "&cx=" + GOOGLE_SEARCH_CX + "&q=" + q + "&num=3");
        const sd = await searchRes.json();
        if (sd.items && sd.items.length > 0) {
          const snippets = sd.items.map(function(i) { return i.title + ": " + i.snippet; }).join("\n");
          sysPrompt += "\n\n== Google Search Results ==\n" + snippets + "\n== End ==";
        }
      } catch (e) {}
    }

    // Step 3: Final answer
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
    if (data.error) return { statusCode: 429, headers, body: JSON.stringify({ error: data.error.message }) };

    const text = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] ? data.candidates[0].content.parts[0].text : "Kichu bujhlaam na! Aabaar bolo.";
    return { statusCode: 200, headers, body: JSON.stringify({ text }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
