const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
Role: You are the "TwagiyeNow Smart Assistant," a specialized AI agent integrated into a React Native mobile application. Your goal is to simplify bus travel in Rwanda. You are culturally aware, polite, and efficient.

Language Capabilities:
1. You are fully bilingual in Kinyarwanda and English.
2. You must support "Kinyarwanda-English code-switching" (e.g., "Ndashaka kubuka ticket ya bus").
3. Always respond in the language the user is using, but keep the tone helpful and professional.

Contextual Knowledge:
- You know the major bus parks in Rwanda (Nyabugogo, Musanze, Rubavu, Huye, Kayonza).
- You understand the geography of Rwanda's districts (Burera, Rulindo, Rutsiro, Ngoma, etc.).
- You are aware that the user is on a mobile device; keep responses concise and scannable.

Functional Integration (Critical):
You act as a router for the React Native app. When a user expresses a clear intent, append a JSON block at the end of your response.

1. Intent: Search for a bus - Keywords: "Ndashaka kujya", "Go to", "Find a bus", "Schedule".
   - JSON: {"action": "NAVIGATE_SEARCH", "params": {"from": "City", "to": "City"}}

2. Intent: Track a bus - Keywords: "Iri he?", "Where is my bus?", "Track".
   - JSON: {"action": "NAVIGATE_TRACK", "params": {"ticketId": "active"}}

3. Intent: View Notifications - Keywords: "Amakuru", "Update", "Delayed".
   - JSON: {"action": "NAVIGATE_NOTIFICATIONS"}

4. Intent: View a specific bus / book a specific trip - When trips data is provided in the message and user picks one or says "book this", "I want this bus", "nimufate uyu".
   - JSON: {"action": "NAVIGATE_BUS_DETAILS", "params": {"schedule": <the full schedule object>}}

5. Intent: Go to checkout / pay - Keywords: "Pay", "Checkout", "Confirm booking", "Wishaka kwishyura", and a schedule is already known.
   - JSON: {"action": "NAVIGATE_CHECKOUT", "params": {"schedule": <the full schedule object>}}

When trips are provided to you in a message (as JSON data), present them clearly to the user showing: bus name, from → to, departure time, price in RWF, and available seats. Then ask which one they want to book.

Response Strategy:
1. Acknowledge the user's request warmly in their language.
2. Provide helpful information concisely.
3. Include the JSON block on a new line at the very end only when navigation intent is detected.
`;

const voiceChat = async (req, res) => {
  const { audioBase64, history = [] } = req.body;
  if (!audioBase64) return res.status(400).json({ error: 'Audio is required' });

  try {
    const chatSession = ai.chats.create({
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite',
      config: { systemInstruction: SYSTEM_INSTRUCTION },
      history,
    });

    const response = await chatSession.sendMessage({
      message: {
        parts: [
          { text: 'The user sent a voice message. Listen and respond as the TwagiyeNow Smart Assistant.' },
          { inlineData: { mimeType: 'audio/m4a', data: audioBase64 } },
        ],
      },
    });

    return res.json({ reply: response.text?.trim() || '' });
  } catch (error) {
    console.error('Voice chat error:', error?.message);
    return res.status(500).json({ error: error?.message || 'Voice chat failed' });
  }
};

const chat = async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const chatSession = ai.chats.create({
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite',
      config: { systemInstruction: SYSTEM_INSTRUCTION },
      history,
    });

    const response = await chatSession.sendMessage({ message });
    return res.json({ text: response.text });
  } catch (error) {
    console.error('Gemini error:', error?.message);
    const status = error?.status || 500;
    return res.status(status).json({ error: error?.message || 'AI service error' });
  }
};

const pool = require('../db');

const searchTrips = async (req, res) => {
  const { from, to, date } = req.query;
  try {
    let query, params;
    if (from && to) {
      query = `
        SELECT s.*, r.from_city, r.to_city, r.distance_km, b.name as bus_name, b.plate, b.capacity,
          (b.capacity - COUNT(bk.id) FILTER (WHERE bk.status = 'confirmed')) as available_seats
        FROM schedules s
        JOIN routes r ON s.route_id = r.id
        JOIN buses b ON s.bus_id = b.id
        LEFT JOIN bookings bk ON bk.schedule_id = s.id
        WHERE LOWER(r.from_city) LIKE LOWER($1) AND LOWER(r.to_city) LIKE LOWER($2)
        ${date ? 'AND DATE(s.departure_time) = $3' : ''}
        GROUP BY s.id, r.from_city, r.to_city, r.distance_km, b.name, b.plate, b.capacity
        ORDER BY s.departure_time ASC LIMIT 5
      `;
      params = date ? [`%${from}%`, `%${to}%`, date] : [`%${from}%`, `%${to}%`];
    } else {
      query = `
        SELECT s.*, r.from_city, r.to_city, r.distance_km, b.name as bus_name, b.plate, b.capacity,
          (b.capacity - COUNT(bk.id) FILTER (WHERE bk.status = 'confirmed')) as available_seats
        FROM schedules s
        JOIN routes r ON s.route_id = r.id
        JOIN buses b ON s.bus_id = b.id
        LEFT JOIN bookings bk ON bk.schedule_id = s.id
        ${date ? 'WHERE DATE(s.departure_time) = $1' : 'WHERE s.departure_time >= NOW()'}
        GROUP BY s.id, r.from_city, r.to_city, r.distance_km, b.name, b.plate, b.capacity
        ORDER BY s.departure_time ASC LIMIT 5
      `;
      params = date ? [date] : [];
    }
    const result = await pool.query(query, params);
    return res.json({ trips: result.rows });
  } catch (error) {
    console.error('Search trips error:', error?.message);
    return res.status(500).json({ error: 'Failed to fetch trips' });
  }
};

module.exports = { chat, voiceChat, searchTrips };
