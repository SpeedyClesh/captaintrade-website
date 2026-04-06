/* =============================================
   CAPTAINTRADE — widget.js
   AI Chat Widget — floating + embedded
   Calls /.netlify/functions/chat (serverless)
   ============================================= */

(function () {
  'use strict';

  const API_ENDPOINT = '/.netlify/functions/chat';
  const SESSION_ID   = 'ct_' + Math.random().toString(36).slice(2, 10);

  const WELCOME_MSG  = "Hey — I'm CaptainTrade's AI assistant. Ask me anything about trading, development, AI, or working with CaptainTrade. What's on your mind?";

  const SUGGESTIONS  = [
    'What services do you offer?',
    'How do I start learning FX trading?',
    'What tech stack do you use?',
    'How does trading mentorship work?',
  ];

  const SEND_ICON = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>`;

  const CHAT_ICON = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
  </svg>`;

  const CLOSE_ICON = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>`;

  /* ── Shared message history (both widgets share context) ── */
  let messageHistory = [];
  let isLoading = false;

  /* ── API call ── */
  async function sendMessage(userText) {
    if (isLoading || !userText.trim()) return null;
    isLoading = true;

    messageHistory.push({ role: 'user', content: userText.trim() });

    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messageHistory,
          sessionId: SESSION_ID,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Request failed');

      const reply = data.response;
      messageHistory.push({ role: 'assistant', content: reply });
      return reply;

    } catch (err) {
      console.error('Widget error:', err);
      const errMsg = err.message || 'Something went wrong. Please try again.';
      messageHistory.push({ role: 'assistant', content: errMsg });
      return errMsg;
    } finally {
      isLoading = false;
    }
  }

  /* ── Shared bubble render helpers ── */
  function createBubble(role, text) {
    const wrap = document.createElement('div');
    wrap.className = `ct-msg ${role}`;

    const av = document.createElement(role === 'bot' ? 'img' : 'div');
    av.className = `ct-msg-avatar ${role === 'user' ? 'user-av' : ''}`;
    if (role === 'bot') {
      av.src = '/assets/images/pfp.jpg';
      av.alt = 'CaptainTrade';
    } else {
      av.textContent = 'You';
    }

    const bubble = document.createElement('div');
    bubble.className = 'ct-msg-bubble';
    bubble.textContent = text;

    wrap.appendChild(av);
    wrap.appendChild(bubble);
    return wrap;
  }

  function createTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'ct-msg bot ct-typing';
    wrap.innerHTML = `
      <img class="ct-msg-avatar" src="/assets/images/pfp.jpg" alt="CaptainTrade" />
      <div class="ct-msg-bubble">
        <div class="ct-typing-dot"></div>
        <div class="ct-typing-dot"></div>
        <div class="ct-typing-dot"></div>
      </div>`;
    return wrap;
  }

  function scrollToBottom(el) {
    el.scrollTop = el.scrollHeight;
  }

  /* ══════════════════════════════════════════
     FLOATING BUBBLE WIDGET
  ══════════════════════════════════════════ */
  function initFloating() {
    /* Don't init twice */
    if (document.getElementById('ctBubble')) return;

    /* Wrapper */
    const bubble = document.createElement('div');
    bubble.className = 'ct-bubble';
    bubble.id = 'ctBubble';

    /* Tooltip */
    const label = document.createElement('div');
    label.className = 'ct-bubble-label';
    label.textContent = 'Ask CaptainTrade AI';
    label.style.display = 'none';
    bubble.appendChild(label);

    /* Trigger button */
    const btn = document.createElement('button');
    btn.className = 'ct-bubble-btn';
    btn.setAttribute('aria-label', 'Open AI chat');
    btn.innerHTML = `
      <svg class="icon-chat" viewBox="0 0 24 24">${CHAT_ICON.replace(/<svg[^>]*>/, '').replace('</svg>', '')}</svg>
      <svg class="icon-close" viewBox="0 0 24 24">${CLOSE_ICON.replace(/<svg[^>]*>/, '').replace('</svg>', '')}</svg>`;
    bubble.appendChild(btn);

    /* Chat window */
    const win = document.createElement('div');
    win.className = 'ct-chat-window';
    win.id = 'ctChatWindow';
    win.innerHTML = `
      <div class="ct-chat-header">
        <div class="ct-chat-header-left">
          <img class="ct-chat-avatar" src="/assets/images/pfp.jpg" alt="CaptainTrade" />
          <div>
            <div class="ct-chat-title">CaptainTrade AI</div>
            <div class="ct-chat-status"><span class="ct-status-dot"></span>Online</div>
          </div>
        </div>
        <button class="ct-chat-close" id="ctChatClose" aria-label="Close chat">✕</button>
      </div>
      <div class="ct-messages" id="ctMessages"></div>
      <div class="ct-chat-input-area">
        <textarea class="ct-chat-input" id="ctInput" rows="1"
          placeholder="Ask me anything..."></textarea>
        <button class="ct-chat-send" id="ctSend" aria-label="Send">${SEND_ICON}</button>
      </div>
      <div class="ct-powered">Powered by Claude · CaptainTrade.dev</div>`;

    document.body.appendChild(win);
    document.body.appendChild(bubble);

    const messagesEl = document.getElementById('ctMessages');
    const inputEl    = document.getElementById('ctInput');
    const sendBtn    = document.getElementById('ctSend');
    let isOpen       = false;
    let welcomed     = false;

    function openChat() {
      isOpen = true;
      win.classList.add('open');
      btn.classList.add('open');
      label.style.display = 'none';
      inputEl.focus();
      if (!welcomed) {
        welcomed = true;
        messagesEl.appendChild(createBubble('bot', WELCOME_MSG));
        scrollToBottom(messagesEl);
      }
    }

    function closeChat() {
      isOpen = false;
      win.classList.remove('open');
      btn.classList.remove('open');
    }

    btn.addEventListener('click', () => isOpen ? closeChat() : openChat());
    document.getElementById('ctChatClose').addEventListener('click', closeChat);

    /* Show label on hover after 1.5s */
    setTimeout(() => {
      if (!isOpen) label.style.display = 'block';
      setTimeout(() => { label.style.display = 'none'; }, 4000);
    }, 1500);

    async function handleSend() {
      const text = inputEl.value.trim();
      if (!text || isLoading) return;

      inputEl.value = '';
      inputEl.style.height = 'auto';
      sendBtn.disabled = true;

      messagesEl.appendChild(createBubble('user', text));
      const typing = createTyping();
      messagesEl.appendChild(typing);
      scrollToBottom(messagesEl);

      const reply = await sendMessage(text);
      messagesEl.removeChild(typing);

      if (reply) {
        messagesEl.appendChild(createBubble('bot', reply));
        scrollToBottom(messagesEl);
      }
      sendBtn.disabled = false;
      inputEl.focus();
    }

    sendBtn.addEventListener('click', handleSend);
    inputEl.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    });

    /* Auto-grow textarea */
    inputEl.addEventListener('input', () => {
      inputEl.style.height = 'auto';
      inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + 'px';
    });
  }

  /* ══════════════════════════════════════════
     EMBEDDED WIDGET (homepage)
  ══════════════════════════════════════════ */
  function initEmbedded() {
    const container = document.getElementById('ctEmbedded');
    if (!container) return;

    container.innerHTML = `
      <section class="widget-section">
        <div class="container">
          <div class="widget-inner">

            <div class="widget-left reveal">
              <p class="section-label">// ai assistant</p>
              <h2 class="widget-title">Ask <span class="accent">CaptainTrade</span></h2>
              <p class="widget-desc">
                Have a question about trading, development, AI engineering, or working with me?
                Ask directly — get a real answer instantly.
              </p>
              <div class="widget-capabilities">
                <div class="widget-cap"><div class="widget-cap-dot"></div>Trading strategies & market analysis</div>
                <div class="widget-cap"><div class="widget-cap-dot"></div>Web development & tech stack advice</div>
                <div class="widget-cap"><div class="widget-cap-dot"></div>AI & prompt engineering questions</div>
                <div class="widget-cap"><div class="widget-cap-dot"></div>Services, mentorship & collaboration</div>
              </div>
            </div>

            <div class="widget-right reveal-right">
              <div class="widget-chat-box">
                <div class="widget-chat-header">
                  <img class="widget-chat-avatar" src="assets/images/pfp.jpg" alt="CaptainTrade" />
                  <div>
                    <div class="widget-chat-name">CaptainTrade AI</div>
                    <div class="widget-chat-sub"><span class="ct-status-dot"></span>Ready to help</div>
                  </div>
                </div>
                <div class="widget-messages" id="widgetMessages">
                  <div class="ct-msg bot">
                    <img class="ct-msg-avatar" src="assets/images/pfp.jpg" alt="CaptainTrade" />
                    <div class="ct-msg-bubble">${WELCOME_MSG}</div>
                  </div>
                </div>
                <div class="widget-suggestions" id="widgetSuggestions">
                  ${SUGGESTIONS.map(s =>
                    `<button class="widget-suggestion">${s}</button>`
                  ).join('')}
                </div>
                <div class="widget-input-area">
                  <textarea class="widget-input" id="widgetInput" rows="1"
                    placeholder="Type your question..."></textarea>
                  <button class="widget-send" id="widgetSend" aria-label="Send">${SEND_ICON}</button>
                </div>
                <div class="widget-powered">Powered by Claude · CaptainTrade.dev</div>
              </div>
            </div>

          </div>
        </div>
      </section>`;

    const messagesEl = document.getElementById('widgetMessages');
    const inputEl    = document.getElementById('widgetInput');
    const sendBtn    = document.getElementById('widgetSend');
    const suggsEl    = document.getElementById('widgetSuggestions');

    async function handleSend(text) {
      text = text || inputEl.value.trim();
      if (!text || isLoading) return;

      /* Hide suggestions after first message */
      if (suggsEl) suggsEl.style.display = 'none';

      inputEl.value = '';
      inputEl.style.height = 'auto';
      sendBtn.disabled = true;

      messagesEl.appendChild(createBubble('user', text));
      const typing = createTyping();
      messagesEl.appendChild(typing);
      scrollToBottom(messagesEl);

      const reply = await sendMessage(text);
      messagesEl.removeChild(typing);

      if (reply) {
        messagesEl.appendChild(createBubble('bot', reply));
        scrollToBottom(messagesEl);
      }
      sendBtn.disabled = false;
      inputEl.focus();
    }

    sendBtn.addEventListener('click', () => handleSend());

    inputEl.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    });

    inputEl.addEventListener('input', () => {
      inputEl.style.height = 'auto';
      inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + 'px';
    });

    /* Suggestion chips */
    document.querySelectorAll('.widget-suggestion').forEach(btn => {
      btn.addEventListener('click', () => handleSend(btn.textContent));
    });
  }

  /* ── Init both on DOM ready ── */
  function init() {
    initFloating();
    initEmbedded();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
