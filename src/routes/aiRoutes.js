const express = require('express');
const Groq = require('groq-sdk');

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are TwagiyeNow AI Assistant, a helpful travel assistant for a Rwandan bus booking app called TwagiyeNow.
You help users with:
- Finding bus routes between Rwandan cities (Kigali, Musanze, Huye, Rubavu, Rusizi, Nyagatare, etc.)
- Trip planning and travel advice in Rwanda
- Bus booking guidance and seat selection
- Travel tips for Rwanda
Keep responses concise, friendly, and focused on Rwanda travel. Always respond in the same language the user writes in.`;

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message) return res.status(400).json({ message: 'Message is required' });

  try {
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

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error('Groq error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
