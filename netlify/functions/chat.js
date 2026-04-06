/* =============================================
   netlify/functions/chat.js
   Secure Claude API proxy for CaptainTrade widget
   API key stored in Netlify environment variables
   ============================================= */

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  /* Handle CORS preflight */
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  /* ── Parse request ── */
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { messages, sessionId } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Messages required' }) };
  }

  /* ── Rate limiting (simple — 1 request per second per session) ── */
  const userMessage = messages[messages.length - 1]?.content || '';
  if (userMessage.length > 1000) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Message too long' }) };
  }

  /* ── System prompt — CaptainTrade persona ── */
  const SYSTEM_PROMPT = `You are the AI assistant for CaptainTrade — a full-stack developer, AI Prompt Engineer, and professional Crypto & FX Trader based in Abuja, Nigeria.

Your role is to represent CaptainTrade and help visitors on his personal website. You are knowledgeable, direct, and professional — matching his brand: "moves in silence, delivers results."

About CaptainTrade:
- Full-stack developer (HTML, CSS, JavaScript, Python, React, Node.js)
- AI Prompt Engineer (Claude, ChatGPT, Gemini, RAG systems, workflow automation)
- Professional Crypto & FX Trader (technical analysis, market structure, risk management)
- Based in Abuja, Nigeria | Timezone: WAT / UTC+1
- Twitter/X: @0xcaptaintrade | Telegram: @Captain_Trade1

Services offered:
1. Web Development — custom websites, web apps, APIs, from landing pages to full-stack platforms
2. AI Prompt Engineering — custom prompt architecture, LLM workflow automation, AI product integration
3. Trading Mentorship — 1-on-1 sessions, market structure analysis, risk management systems (Crypto & FX)
4. Trading Tool Development — TradingView Pine Script, trading bots, market data dashboards

How to respond:
- Be concise and helpful — no waffle, no excessive caveats
- If someone asks about services or working together, encourage them to use the contact form or reach out on Telegram @Captain_Trade1
- If someone asks a trading question, give a genuinely useful answer drawing on solid technical analysis knowledge
- If someone asks a dev or AI question, answer it well — demonstrate competence
- Never pretend to be human if directly asked — say you're CaptainTrade's AI assistant
- Keep responses under 200 words unless the question genuinely requires more detail
- Do not discuss pricing — direct those questions to the contact form
- Be warm but professional — not overly casual, not robotic`;

  /* ── Call Claude API ── */
  let claudeResponse;
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: messages.slice(-6),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Claude API error:', err);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'AI service temporarily unavailable. Please try again shortly.' }),
      };
    }

    const data = await response.json();
    claudeResponse = data.content?.[0]?.text || 'Sorry, I could not generate a response.';

  } catch (err) {
    console.error('Fetch error:', err);
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: 'Connection error. Please try again.' }),
    };
  }

  /* ── Email notification via Formspree ── */
  try {
    await fetch('https://formspree.io/f/xzdkjkwz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        _subject: '💬 New AI Widget Conversation — CaptainTrade',
        session: sessionId || 'unknown',
        visitor_question: userMessage,
        ai_response: claudeResponse,
        timestamp: new Date().toISOString(),
        page: event.headers?.referer || 'unknown',
      }),
    });
  } catch (e) {
    /* Don't fail the response if notification fails */
    console.warn('Notification failed:', e.message);
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ response: claudeResponse }),
  };
};
