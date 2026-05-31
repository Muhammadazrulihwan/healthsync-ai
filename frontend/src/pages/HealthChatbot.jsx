import { useState, useEffect, useRef } from 'react';
import { sendChat, getChatTopics } from '../services/api';
import { MarkdownContent, TypingIndicator, Disclaimer, useToast, cardStyle, AI_AVATAR, USER_AVATAR } from '../components/UI';

const STORAGE_KEY   = 'healthsync_chat_sessions';
const MAX_SESSIONS  = 10; // maksimal 10 sesi tersimpan

const QUICK_ACTIONS = [
  { icon:'schedule',     label:'Jadwal pemeriksaan' },
  { icon:'prescriptions',label:'Info obat' },
  { icon:'vital_signs',  label:'Tips tekanan darah' },
];

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: "Hello! 👋 I'm HealthSync AI, your health education assistant. Ask me anything about health — from common diseases, nutrition, exercise, to healthy living tips. What would you like to know?",
  timestamp: new Date().toISOString(),
};

// ── localStorage helpers ────────────────────────────────────────────────────
const loadSessions = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveSessions = (sessions) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch { /* storage full — ignore */ }
};

const formatTime = (iso) => {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);
  if (diffMin < 1)   return 'Just now';
  if (diffMin < 60)  return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return 'Yesterday';
  return d.toLocaleDateString('id-ID', { day:'numeric', month:'short' });
};

const getSessionTitle = (messages) => {
  const firstUser = messages.find(m => m.role === 'user');
  if (!firstUser) return 'New conversation';
  const text = firstUser.content;
  return text.length > 40 ? text.slice(0, 40) + '...' : text;
};

// ── Group sessions by date ──────────────────────────────────────────────────
const groupByDate = (sessions) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const groups = { Today:[], Yesterday:[], Earlier:[] };
  sessions.forEach(s => {
    const d = new Date(s.createdAt); d.setHours(0,0,0,0);
    if (d >= today) groups.Today.push(s);
    else if (d >= yesterday) groups.Yesterday.push(s);
    else groups.Earlier.push(s);
  });
  return groups;
};

export default function HealthChatbot() {
  const toast = useToast();

  // ── Sessions state ─────────────────────────────────────────────────────────
  const [sessions, setSessions]       = useState(() => loadSessions());
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages]       = useState([INITIAL_MESSAGE]);
  const [input, setInput]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [topics, setTopics]           = useState([]);
  const [sessionId, setSessionId]     = useState(null); // backend session_id
  const [searchQuery, setSearchQuery] = useState('');
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    getChatTopics().then(d => setTopics(d.topics || [])).catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages, loading]);

  // ── Save current session whenever messages change ──────────────────────────
  useEffect(() => {
    if (!activeSessionId || messages.length <= 1) return;
    setSessions(prev => {
      const updated = prev.map(s =>
        s.id === activeSessionId
          ? { ...s, messages, updatedAt: new Date().toISOString() }
          : s
      );
      saveSessions(updated);
      return updated;
    });
  }, [messages]);

  // ── Start new chat session ─────────────────────────────────────────────────
  const startNewSession = () => {
    const newSession = {
      id: Date.now().toString(),
      messages: [INITIAL_MESSAGE],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSessions(prev => {
      const updated = [newSession, ...prev].slice(0, MAX_SESSIONS);
      saveSessions(updated);
      return updated;
    });
    setActiveSessionId(newSession.id);
    setMessages([INITIAL_MESSAGE]);
    setSessionId(null);
    setInput('');
    inputRef.current?.focus();
  };

  // ── Load existing session ──────────────────────────────────────────────────
  const loadSession = (session) => {
    setActiveSessionId(session.id);
    setMessages(session.messages);
    setSessionId(null);
    setInput('');
  };

  // ── Delete session ─────────────────────────────────────────────────────────
  const deleteSession = (e, sessionId) => {
    e.stopPropagation();
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== sessionId);
      saveSessions(updated);
      return updated;
    });
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
      setMessages([INITIAL_MESSAGE]);
      setSessionId(null);
    }
  };

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = async (text) => {
    const message = text || input.trim();
    if (!message || loading) return;
    setInput('');

    // Auto-create session on first message
    if (!activeSessionId) {
      const newSession = {
        id: Date.now().toString(),
        messages: [INITIAL_MESSAGE],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSessions(prev => {
        const updated = [newSession, ...prev].slice(0, MAX_SESSIONS);
        saveSessions(updated);
        return updated;
      });
      setActiveSessionId(newSession.id);
    }

    const userMsg = { role:'user', content:message, timestamp: new Date().toISOString() };
    setMessages(p => [...p, userMsg]);
    setLoading(true);

    try {
      const history = messages.map(m => ({ role:m.role, content:m.content }));
      const data = await sendChat({ message, conversation_history:history, session_id:sessionId });
      if (!sessionId && data.session_id) setSessionId(data.session_id);
      const aiMsg = { role:'assistant', content:data.response, timestamp: new Date().toISOString() };
      setMessages(p => [...p, aiMsg]);
    } catch(e) {
      toast(e.message || 'Failed to send message.');
      setMessages(p => p.slice(0,-1));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  // ── Filter sessions by search ──────────────────────────────────────────────
  const filteredSessions = sessions.filter(s =>
    getSessionTitle(s.messages).toLowerCase().includes(searchQuery.toLowerCase())
  );
  const grouped = groupByDate(filteredSessions);

  return (
    <div style={{ display:'flex', height:'calc(100vh - 7rem)', gap:'1.5rem' }}>

      {/* ── Sidebar ── */}
      <aside className="hide-mobile" style={{ width:'240px', flexShrink:0, display:'flex', flexDirection:'column', gap:'0.75rem' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1rem', color:'var(--on-surface)' }}>Recent Chats</h2>
          <button onClick={startNewSession} title="New chat" style={{ width:30, height:30, borderRadius:'50%', background:'var(--primary)', color:'white', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background='var(--on-primary-fixed-variant)'}
            onMouseLeave={e => e.currentTarget.style.background='var(--primary)'}>
            <span className="material-symbols-outlined" style={{ fontSize:'16px' }}>add</span>
          </button>
        </div>

        {/* Search */}
        <div style={{ position:'relative' }}>
          <span className="material-symbols-outlined" style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', fontSize:'16px', color:'var(--on-surface-variant)' }}>search</span>
          <input
            style={{ width:'100%', padding:'0.55rem 0.75rem 0.55rem 34px', border:'none', borderRadius:'8px', background:'var(--surface-container)', fontFamily:'var(--font-body)', fontSize:'0.85rem', outline:'none', color:'var(--on-surface)' }}
            placeholder="Search history..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Session list */}
        <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:'4px' }}>
          {sessions.length === 0 ? (
            <div style={{ textAlign:'center', padding:'1.5rem 0.5rem', color:'var(--on-surface-variant)', fontSize:'0.82rem' }}>
              <span className="material-symbols-outlined" style={{ display:'block', fontSize:'32px', marginBottom:'6px', color:'var(--outline)' }}>chat_bubble_outline</span>
              No chats yet.<br/>Start a conversation!
            </div>
          ) : (
            Object.entries(grouped).map(([group, items]) =>
              items.length > 0 && (
                <div key={group}>
                  <div style={{ fontSize:'0.7rem', fontWeight:600, color:'var(--on-surface-variant)', textTransform:'uppercase', letterSpacing:'0.08em', margin:'8px 0 4px 4px' }}>{group}</div>
                  {items.map(session => (
                    <div key={session.id}
                      onClick={() => loadSession(session)}
                      style={{
                        padding:'0.6rem 0.75rem', borderRadius:'8px', cursor:'pointer',
                        background: activeSessionId===session.id ? 'var(--secondary-container)' : 'transparent',
                        border: activeSessionId===session.id ? '1px solid var(--outline-variant)' : '1px solid transparent',
                        transition:'all 0.15s', display:'flex', alignItems:'flex-start', gap:'6px',
                      }}
                      onMouseEnter={e => { if (activeSessionId!==session.id) e.currentTarget.style.background='var(--surface-container)'; }}
                      onMouseLeave={e => { if (activeSessionId!==session.id) e.currentTarget.style.background='transparent'; }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', color:'var(--on-surface)', fontWeight: activeSessionId===session.id ? 600 : 400, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {getSessionTitle(session.messages)}
                        </div>
                        <div style={{ fontSize:'0.7rem', color:'var(--on-surface-variant)', marginTop:'2px' }}>
                          {formatTime(session.updatedAt)} · {session.messages.length - 1} messages
                        </div>
                      </div>
                      {/* Delete button */}
                      <button onClick={e => deleteSession(e, session.id)} title="Delete" style={{ background:'transparent', border:'none', cursor:'pointer', color:'var(--outline)', padding:'1px', flexShrink:0, opacity:0, transition:'opacity 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.color='var(--error)'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity='0'; e.currentTarget.style.color='var(--outline)'; }}>
                        <span className="material-symbols-outlined" style={{ fontSize:'15px' }}>delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )
            )
          )}
        </div>

        {/* Topics */}
        {topics.length > 0 && (
          <div>
            <div style={{ fontSize:'0.72rem', fontWeight:600, color:'var(--on-surface-variant)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px' }}>Topics</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
              {topics.slice(0,6).map(t => (
                <button key={t.id} onClick={() => sendMessage(t.description)} style={{
                  padding:'0.3rem 0.65rem', borderRadius:'999px',
                  border:'1px solid var(--outline-variant)', background:'var(--surface)',
                  color:'var(--on-surface-variant)', fontFamily:'var(--font-body)',
                  fontSize:'0.75rem', cursor:'pointer', transition:'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--primary)'; e.currentTarget.style.color='var(--primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--outline-variant)'; e.currentTarget.style.color='var(--on-surface-variant)'; }}>
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* ── Chat canvas ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', ...cardStyle, overflow:'hidden' }}>

        {/* Chat header */}
        <div style={{ padding:'0.75rem 1.25rem', borderBottom:'1px solid var(--outline-variant)', display:'flex', alignItems:'center', gap:'10px' }}>
          <img src={AI_AVATAR} alt="AI" style={{ width:32, height:32, borderRadius:'8px', border:'1.5px solid var(--primary)', background:'var(--primary-container)' }} />
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.9rem', color:'var(--on-surface)' }}>HealthSync AI</div>
            <div style={{ fontSize:'0.72rem', color:'var(--tertiary)', display:'flex', alignItems:'center', gap:'4px' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--tertiary)' }} />
              Online
            </div>
          </div>
          {activeSessionId && (
            <button onClick={startNewSession} style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'5px', background:'var(--surface-container)', border:'none', borderRadius:'999px', padding:'0.35rem 0.85rem', cursor:'pointer', color:'var(--on-surface-variant)', fontFamily:'var(--font-body)', fontSize:'0.8rem' }}
              onMouseEnter={e => e.currentTarget.style.background='var(--surface-container-high)'}
              onMouseLeave={e => e.currentTarget.style.background='var(--surface-container)'}>
              <span className="material-symbols-outlined" style={{ fontSize:'15px' }}>add</span>
              New Chat
            </button>
          )}
        </div>

        {/* Messages area */}
        <div style={{ flex:1, overflowY:'auto', padding:'1.25rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div style={{ display:'flex', justifyContent:'center' }}>
            <span style={{ fontSize:'0.75rem', background:'var(--surface-container-highest)', color:'var(--on-surface-variant)', padding:'0.25rem 0.75rem', borderRadius:'999px' }}>
              {new Date().toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long' })}
            </span>
          </div>

          {messages.map((msg, i) => (
            <div key={i} className="anim-fade-up" style={{ display:'flex', gap:'8px', flexDirection: msg.role==='user' ? 'row-reverse' : 'row', alignItems:'flex-start', maxWidth:'80%', alignSelf: msg.role==='user' ? 'flex-end' : 'flex-start' }}>
              <img
                src={msg.role==='assistant' ? AI_AVATAR : USER_AVATAR}
                alt={msg.role==='assistant' ? 'AI' : 'User'}
                style={{ width:32, height:32, borderRadius:'50%', flexShrink:0, border: msg.role==='assistant' ? '1.5px solid var(--primary)' : '1.5px solid var(--outline-variant)', background: msg.role==='assistant' ? 'var(--primary-container)' : 'var(--secondary-container)', boxShadow:'0 1px 4px rgba(0,0,0,0.1)', objectFit:'cover' }}
              />
              <div style={{ background: msg.role==='user' ? 'var(--surface-container-lowest)' : 'var(--secondary-container)', border: `1px solid ${msg.role==='user' ? 'var(--outline-variant)' : 'transparent'}`, borderRadius: msg.role==='user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', padding:'0.75rem 1rem', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
                {msg.role==='assistant' ? <MarkdownContent content={msg.content} /> : (
                  <p style={{ fontSize:'0.9rem', lineHeight:1.6, color:'var(--on-surface)' }}>{msg.content}</p>
                )}
                {msg.timestamp && (
                  <div style={{ fontSize:'0.65rem', color:'var(--outline)', marginTop:'4px', textAlign: msg.role==='user' ? 'right' : 'left' }}>
                    {new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display:'flex', gap:'8px', alignItems:'flex-start' }}>
              <img src={AI_AVATAR} alt="AI" style={{ width:32, height:32, borderRadius:'50%', border:'1.5px solid var(--primary)', background:'var(--primary-container)', objectFit:'cover', boxShadow:'0 1px 4px rgba(0,0,0,0.1)' }} />
              <div style={{ background:'var(--secondary-container)', borderRadius:'18px 18px 18px 4px', padding:'0.6rem 1rem' }}>
                <TypingIndicator />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Disclaimer */}
        <div style={{ padding:'0.65rem 1.25rem', borderTop:'1px solid var(--outline-variant)' }}>
          <Disclaimer />
        </div>

        {/* Quick actions */}
        <div style={{ padding:'0.65rem 1.25rem 0', borderTop:'1px solid var(--outline-variant)', display:'flex', gap:'8px', overflowX:'auto' }}>
          {QUICK_ACTIONS.map(a => (
            <button key={a.label} onClick={() => sendMessage(a.label)} style={{ display:'flex', alignItems:'center', gap:'5px', whiteSpace:'nowrap', padding:'0.35rem 0.85rem', borderRadius:'999px', border:'1px solid var(--outline-variant)', background:'var(--surface)', color:'var(--on-surface)', fontFamily:'var(--font-body)', fontSize:'0.8rem', cursor:'pointer', transition:'all 0.15s', flexShrink:0 }}
              onMouseEnter={e => e.currentTarget.style.background='var(--surface-container)'}
              onMouseLeave={e => e.currentTarget.style.background='var(--surface)'}>
              <span className="material-symbols-outlined" style={{ fontSize:'14px' }}>{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div style={{ padding:'0.75rem 1.25rem', display:'flex', alignItems:'flex-end', gap:'8px', background:'var(--surface-container-lowest)' }}>
          <div style={{ flex:1, display:'flex', alignItems:'flex-end', gap:'8px', background:'var(--surface-container-low)', border:'1px solid var(--outline-variant)', borderRadius:'16px', padding:'0.4rem 0.5rem', transition:'all 0.15s' }}
            onFocusCapture={e => { e.currentTarget.style.borderColor='var(--primary)'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(0,88,188,0.12)'; }}
            onBlurCapture={e => { e.currentTarget.style.borderColor='var(--outline-variant)'; e.currentTarget.style.boxShadow='none'; }}>
            <textarea ref={inputRef} style={{ flex:1, border:'none', background:'transparent', resize:'none', fontFamily:'var(--font-body)', fontSize:'0.9rem', color:'var(--on-surface)', outline:'none', maxHeight:'120px', minHeight:'36px', lineHeight:1.5, paddingTop:'4px' }}
              placeholder="Type your health query..."
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
              disabled={loading} />
          </div>
          <button onClick={() => sendMessage()} disabled={loading||!input.trim()} style={{ width:42, height:42, borderRadius:'12px', border:'none', background: (loading||!input.trim()) ? 'var(--surface-container)' : 'var(--primary)', color: (loading||!input.trim()) ? 'var(--on-surface-variant)' : 'white', cursor: (loading||!input.trim()) ? 'default' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s', flexShrink:0 }}>
            {loading ? <div className="spinner" style={{ borderTopColor:'var(--on-surface-variant)' }} /> : <span className="material-symbols-outlined" style={{ fontSize:'20px' }}>send</span>}
          </button>
        </div>

        <p style={{ textAlign:'center', fontSize:'0.72rem', color:'var(--on-surface-variant)', padding:'0.4rem', background:'var(--surface-container-lowest)' }}>
          HealthSync AI is not a substitute for professional medical advice.
        </p>
      </div>
    </div>
  );
}