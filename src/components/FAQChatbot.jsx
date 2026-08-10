import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';

// FAQ knowledge base for the chatbot
const FAQ = [
  {
    keywords: ['member', 'join', 'apply', 'apply membership', 'become'],
    answer: 'To become a member, browse the Marketplace, open any cooperative profile and click "Become a Member". You will complete a 4-step application (personal details, nominee info, KYC documents, and review) — it usually takes under 10 minutes.'
  },
  {
    keywords: ['login', 'sign in', 'password', 'forgot', 'account'],
    answer: 'Use the "Sign In" button in the top-right corner. Your session is kept secure with encrypted tokens. If you forget your password, use the "Forgot Password" link on the login page to receive a reset email.'
  },
  {
    keywords: ['account', 'open account', 'saving', 'savings'],
    answer: 'Once your cooperative approves your membership, the admin can open savings/current accounts for you. You will see them under "My Accounts" in your member dashboard.'
  },
  {
    keywords: ['loan', 'borrow', 'credit', 'interest'],
    answer: 'Each cooperative offers its own loan products with different interest rates. Open a cooperative profile in the Marketplace to compare loan products, then apply through your cooperative. Loan approvals are reviewed by the cooperative team.'
  },
  {
    keywords: ['transaction', 'transfer', 'send', 'withdraw', 'deposit'],
    answer: 'Transactions such as deposits, withdrawals, and transfers are recorded by your cooperative staff and appear instantly in "My Transactions". You can also download statements from the Reports section.'
  },
  {
    keywords: ['offline', 'internet', 'sync', 'connection'],
    answer: 'Aama Cooperatives supports offline-first operation. Staff can keep working without internet; operations are queued and automatically synced to the cloud once connectivity is restored. Check the "Offline Sync" page under Services.'
  },
  {
    keywords: ['sms', 'whatsapp', 'mobile banking', 'balance check', 'banking'],
    answer: 'We offer SMS and WhatsApp banking so you can check balances and get alerts without internet. Cooperative staff manage these under Services > SMS Banking and Services > WhatsApp Banking.'
  },
  {
    keywords: ['kyc', 'document', 'citizenship', 'verify', 'verification'],
    answer: 'KYC verification requires a citizenship (front and back), a passport photo, and your signature. You can upload these during the membership application, or provide them to your cooperative office directly.'
  },
  {
    keywords: ['cooperative', 'marketplace', 'find', 'search', 'directory'],
    answer: 'The Marketplace is a directory of verified local cooperatives. Use the search bar to filter by name or location, open a profile to compare products and ratings, and apply for membership in one click.'
  },
  {
    keywords: ['charge', 'fee', 'cost', 'price', 'paid'],
    answer: 'Membership and basic services are managed by your cooperative. Any applicable fees are clearly shown in the cooperative profile and during the application process — no hidden charges.'
  },
  {
    keywords: ['security', 'secure', 'safe', 'privacy', 'data'],
    answer: 'Your data is protected with bank-grade encryption, secure login tokens, and strict role-based access. Only authorized cooperative staff can view your records, and we never share your information without consent.'
  },
  {
    keywords: ['help', 'support', 'contact', 'human', 'agent'],
    answer: 'For personalized help, contact your cooperative office directly or email support@aamacooperatives.com. Staff are available Monday–Friday, 9am–6pm. If you need help with this FAQ bot, just ask a question above!'
  }
];

const GREETING = {
  text: '👋 Namaste! I am the Aama Cooperatives FAQ assistant. Ask me anything about membership, accounts, loans, KYC, or banking services.',
  quick: ['How do I become a member?', 'How do I open a savings account?', 'How do loans work?', 'Is my data secure?']
};

const FALLBACK = 'I could not find an exact answer. Please rephrase your question or contact support@aamacooperatives.com for assistance.';

const matchAnswer = (input) => {
  const text = input.toLowerCase();
  let best = null;
  for (const item of FAQ) {
    for (const kw of item.keywords) {
      if (text.includes(kw)) {
        // Prefer the item with the longest matching keyword (more specific)
        if (!best || kw.length > best.length) best = kw;
        break;
      }
    }
  }
  if (!best) return null;
  return FAQ.find(item => item.keywords.includes(best))?.answer;
};

export default function FAQChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bodyRef = useRef(null);

  const scrollToBottom = () => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, open]);

  const sendMessage = (raw) => {
    const text = (raw || input).trim();
    if (!text) return;
    setMessages(prev => [...prev, { from: 'user', text }]);
    setInput('');
    // Simulate a short "typing" delay
    setTimeout(() => {
      const answer = matchAnswer(text) || FALLBACK;
      setMessages(prev => [...prev, { from: 'bot', text: answer }]);
    }, 500);
  };

  const openChat = () => {
    if (!open && messages.length === 0) {
      setMessages([{ from: 'bot', text: GREETING.text }]);
    }
    setOpen(true);
  };

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-panel">
          {/* Header */}
          <div className="chat-header">
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={20} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>Aama Cooperatives Assistant</h4>
              <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.85)' }}>Online • Usually replies instantly</span>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}>
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="chat-body" ref={bodyRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.from}`}>{msg.text}</div>
            ))}
          </div>

          {/* Quick chips */}
          <div className="chat-quick">
            {GREETING.quick.map(q => (
              <button key={q} className="chat-chip" onClick={() => sendMessage(q)}>{q}</button>
            ))}
          </div>

          {/* Input */}
          <div className="chat-input-row">
            <input
              className="chat-input"
              placeholder="Type your question..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button className="chat-send" onClick={() => sendMessage()}>
              <Send size={17} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button className="chat-toggle" onClick={() => open ? setOpen(false) : openChat()} title="FAQ Assistant">
        {open ? <X size={26} /> : <MessageCircle size={26} />}
      </button>
    </div>
  );
}
