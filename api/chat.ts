import { GoogleGenAI } from '@google/genai';

// HeyLola support chatbot powered by Gemini.
// Runs as a Vercel serverless function so the API key stays server-side.
//
// Required env var on Vercel: GEMINI_API_KEY

const SYSTEM_PROMPT = `You are the HeyLola assistant — a warm, concise concierge
for pet parents who travel. Your job is to help users with:
- Vaccination requirements (rabies, distemper, etc.) for travelling dogs and cats
- Pet travel paperwork (EU pet passport, USDA APHIS forms, microchipping standards)
- Country-specific entry rules (quarantine, health certificates, import permits)
- Finding pet-friendly venues in Barcelona, Miami and New York City
- Vet emergencies, grooming and general pet care advice

Style:
- Direct and practical, no filler.
- 2-4 short paragraphs maximum, or a short bullet list if comparing requirements.
- Always mention that requirements change and the user should double-check with
  the destination country's official site or their vet for current rules.
- If the question is unrelated to pets / pet travel, politely redirect:
  "I'm focused on pet travel — for general questions please contact our team
  at hey@heylola.co."
- Never invent specific numbers (vaccination intervals, fees) — describe what
  to check rather than fabricating data.

You're talking to a real pet parent in real time. Be warm, but get to the point.`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: 'GEMINI_API_KEY is not configured on the server.',
      reply: "I'm not configured yet — please email our team at hey@heylola.co and we'll help you out.",
    });
    return;
  }

  try {
    const { message, history } = (req.body || {}) as {
      message?: string;
      history?: ChatMessage[];
    };

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ error: 'Missing message in request body.' });
      return;
    }

    const safeMessage = message.slice(0, 2000);
    const safeHistory = (history || []).slice(-10).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content || '').slice(0, 2000) }],
    }));

    const genAI = new GoogleGenAI({ apiKey });
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...safeHistory,
        { role: 'user', parts: [{ text: safeMessage }] },
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.4,
        maxOutputTokens: 600,
      },
    });

    const reply = (response.text || '').trim() ||
      "I couldn't generate a reply just now. Please try rephrasing or email hey@heylola.co.";

    res.status(200).json({ reply });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('chat handler error', err);
    res.status(500).json({
      error: 'Upstream model error',
      reply: "I'm having trouble reaching my brain right now. Please try again in a moment, or email hey@heylola.co.",
    });
  }
}
