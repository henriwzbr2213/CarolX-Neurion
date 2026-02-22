import "dotenv/config";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import { buildSystemPrompt, buildUserPrompt, normalizeStage } from "./promptBuilder.js";

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

if (!DISCORD_TOKEN || !GEMINI_API_KEY) {
  throw new Error("Defina DISCORD_TOKEN e GEMINI_API_KEY no .env");
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

client.once("ready", () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
  console.log(`🤖 Modelo Gemini em uso: ${GEMINI_MODEL}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const mentioned = message.mentions.has(client.user);
  const isDM = message.channel.isDMBased();
  if (!mentioned && !isDM) return;

  await message.channel.sendTyping();

  try {
    const cleanContent = message.content.replace(/<@!?\d+>/g, "").trim();
    const stage = parseStage(cleanContent);
    const markdownContext = await collectMarkdownContext(message);

    const userPrompt = buildUserPrompt({
      userRequest: cleanContent || "Me ajude a desenvolver meu app.",
      stage,
      markdownContext
    });

    const response = await callGemini({
      apiKey: GEMINI_API_KEY,
      model: GEMINI_MODEL,
      systemInstruction: buildSystemPrompt(),
      userPrompt
    });

    await sendChunkedMessage(message, response);
  } catch (error) {
    console.error(error);
    await message.reply("❌ Falhei ao chamar o Gemini. Verifique token/modelo e tente novamente.");
  }
});

async function callGemini({ apiKey, model, systemInstruction, userPrompt }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload = {
    system_instruction: {
      parts: [{ text: systemInstruction }]
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userPrompt }]
      }
    ],
    generationConfig: {
      temperature: 0.4
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join("\n");

  return text?.trim() || "Não consegui gerar resposta no momento.";
}

function parseStage(content) {
  const match = content.match(/etapa\s*:\s*([a-zA-Zçãõ_\-]+)/i);
  if (!match) return "descoberta";
  return normalizeStage(match[1]);
}

async function collectMarkdownContext(message) {
  const sections = [];

  const markdownUrls = [...message.content.matchAll(/https?:\/\/\S+\.md(\?\S+)?/gi)].map((m) => m[0]);

  for (const url of markdownUrls) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const text = await response.text();
      sections.push(`### Markdown de URL: ${url}\n${text.slice(0, 6000)}`);
    } catch {
      // ignora URL inválida
    }
  }

  for (const [, attachment] of message.attachments) {
    const lowerName = attachment.name?.toLowerCase() || "";
    if (!lowerName.endsWith(".md") && !lowerName.endsWith(".markdown")) continue;

    try {
      const response = await fetch(attachment.url);
      if (!response.ok) continue;
      const text = await response.text();
      sections.push(`### Markdown anexado: ${attachment.name}\n${text.slice(0, 6000)}`);
    } catch {
      // ignora anexo inválido
    }
  }

  return sections.join("\n\n");
}

async function sendChunkedMessage(message, content) {
  const limit = 1900;
  if (content.length <= limit) {
    await message.reply(content);
    return;
  }

  let start = 0;
  while (start < content.length) {
    await message.reply(content.slice(start, start + limit));
    start += limit;
  }
}

client.login(DISCORD_TOKEN);
