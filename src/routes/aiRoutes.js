const express = require('express');
const Groq = require('groq-sdk');

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are TwagiyeNow AI Assistant, a transport-only assistant for a Rwandan bus booking app called TwagiyeNow.

You ONLY answer questions related to:
- Bus routes between Rwandan cities (Kigali, Musanze, Huye, Rubavu, Rusizi, Nyagatare, etc.)
- Bus schedules, departure times, and ticket prices
- Seat booking and ticket information
- Private car bookings
- Travel tips and directions within Rwanda
- Transport costs and journey durations in Rwanda

If the user asks about ANYTHING outside of transport and travel, respond ONLY with:
"I can only help with transport and travel questions. Please ask me about bus routes, schedules, bookings, or travel in Rwanda."

Always respond in the same language the user writes in (Kinyarwanda, English, or French).`;

async function getGroqReply(message, history = []) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.filter(m => m.role && m.text).map(m => ({
      role: m.role === 'model' ? 'assistant' : m.role,
      content: m.text,
    })),
    { role: 'user', content: message },
  ];

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    max_tokens: 512,
  });

  return completion.choices[0].message.content;
}

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ message: 'Message is required' });

  try {
    const reply = await getGroqReply(message, history);
    res.json({ reply });
  } catch (err) {
    console.error('Groq error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ai/voice  (receives base64 audio, transcribes with Whisper, then replies)
router.post('/voice', async (req, res) => {
  const { audioBase64, history = [] } = req.body;
  if (!audioBase64) return res.status(400).json({ message: 'audioBase64 is required' });

  try {
    // Convert base64 to buffer and transcribe with Whisper
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const { Readable } = require('stream');
    const stream = new Readable();
    stream.push(audioBuffer);
    stream.push(null);
    stream.path = 'audio.webm';

    const transcription = await groq.audio.transcriptions.create({
      file: stream,
      model: 'whisper-large-v3',
      language: 'en',
    });

    const transcript = transcription.text;
    if (!transcript) return res.status(400).json({ message: 'Could not transcribe audio' });

    const reply = await getGroqReply(transcript, history);
    res.json({ reply, transcript });
  } catch (err) {
    console.error('Groq voice error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
