import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';

// ─── Avatar images ─────────────────────────────────────────────────────────────
export const AI_AVATAR   = 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=healthsyncai&backgroundColor=0058bc';
export const USER_AVATAR = 'https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=healthuser&backgroundColor=d3e2ed';

// ─── Toast ────────────────────────────────────────────────────────────────────
const ToastContext = createContext(null);
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((msg, type = 'error') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);
  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div style={{ position:'fixed', top:'1rem', right:'1rem', zIndex:9999, display:'flex', flexDirection:'column', gap:'8px' }}>
        {toasts.map(t => (
          <div key={t.id} className="anim-fade-in" style={{
            background: t.type === 'error' ? 'var(--error-container)' : '#F0FDF4',
            border: `1px solid ${t.type === 'error' ? '#FECACA' : '#BBF7D0'}`,
            color: t.type === 'error' ? 'var(--on-error-container)' : '#166534',
            padding:'0.75rem 1rem', borderRadius:'12px', fontSize:'0.85rem',
            fontFamily:'var(--font-body)', maxWidth:'320px',
            boxShadow:'0 4px 12px rgba(0,0,0,0.08)',
            display:'flex', alignItems:'center', gap:'8px'
          }}>
            <span className="material-symbols-outlined" style={{fontSize:'18px'}}>
              {t.type === 'error' ? 'warning' : 'check_circle'}
            </span>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
export const useToast = () => useContext(ToastContext);

// ─── Top Navbar ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Home',      icon: 'home' },
  { id: 'symptom',    label: 'Symptoms',  icon: 'medical_services' },
  { id: 'medication', label: 'Medication',icon: 'medication' },
  { id: 'chatbot',    label: 'Chat',      icon: 'chat_bubble' },
  { id: 'preventive', label: 'Preventive',icon: 'health_and_safety' },
  { id: 'wellness',   label: 'Wellness',  icon: 'self_improvement' },
];

export const Navbar = ({ active, onNavigate, apiOnline }) => (
  <>
    {/* Desktop top navbar */}
    <header className="hide-mobile" style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--outline-variant)',
      position: 'sticky', top: 0, zIndex: 100,
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.6rem 3rem',
    }}>
      {/* Brand */}
      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
        <img
          src={AI_AVATAR}
          alt="HealthSync AI"
          style={{ width:32, height:32, borderRadius:'8px', border:'1.5px solid var(--primary)', background:'var(--primary-container)' }}
        />
        <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.25rem', color:'var(--primary)' }}>HealthSync AI</span>
      </div>

      {/* Nav items */}
      <nav style={{ display:'flex', alignItems:'center', gap:'4px' }}>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)} style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:'2px',
              padding:'0.4rem 1rem', borderRadius:'999px', border:'none',
              cursor:'pointer', transition:'all 0.15s',
              background: isActive ? 'var(--secondary-container)' : 'transparent',
              color: isActive ? 'var(--on-secondary-container)' : 'var(--on-surface-variant)',
              fontFamily:'var(--font-body)', fontSize:'0.75rem', fontWeight: isActive ? 600 : 400,
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-container)'; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <span className={`material-symbols-outlined${isActive ? ' filled' : ''}`} style={{ fontSize:'20px', fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Right actions */}
      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
        <div style={{
          display:'flex', alignItems:'center', gap:'6px',
          fontSize:'0.75rem', fontFamily:'var(--font-body)',
          color: apiOnline ? 'var(--tertiary)' : 'var(--error)',
          background: apiOnline ? 'var(--on-tertiary-container)' : 'var(--error-container)',
          padding:'0.3rem 0.75rem', borderRadius:'999px',
          border: `1px solid ${apiOnline ? 'var(--tertiary-fixed-dim)' : '#FECACA'}`,
        }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background: apiOnline ? 'var(--tertiary)' : 'var(--error)', boxShadow: apiOnline ? '0 0 6px var(--tertiary)' : 'none' }} />
          {apiOnline === null ? 'Checking...' : apiOnline ? 'API Online' : 'API Offline'}
        </div>
        {/* User avatar */}
        <img
          src={USER_AVATAR}
          alt="User"
          style={{ width:36, height:36, borderRadius:'50%', border:'1.5px solid var(--outline-variant)', background:'var(--secondary-container)', objectFit:'cover' }}
        />
      </div>
    </header>

    {/* Mobile bottom nav */}
    <nav className="show-mobile" style={{
      position:'fixed', bottom:0, left:0, right:0,
      background:'var(--surface-container-lowest)',
      borderTop:'1px solid var(--outline-variant)',
      padding:'0.4rem 0.5rem calc(0.4rem + env(safe-area-inset-bottom))',
      zIndex:100, justifyContent:'space-around', alignItems:'center',
    }}>
      {NAV_ITEMS.map(item => {
        const isActive = active === item.id;
        return (
          <button key={item.id} onClick={() => onNavigate(item.id)} style={{
            display:'flex', flexDirection:'column', alignItems:'center', gap:'2px',
            padding:'0.3rem 0.75rem', borderRadius:'999px', border:'none',
            cursor:'pointer',
            background: isActive ? 'var(--secondary-container)' : 'transparent',
            color: isActive ? 'var(--on-secondary-container)' : 'var(--on-surface-variant)',
            fontFamily:'var(--font-body)', fontSize:'0.65rem', fontWeight: isActive ? 600 : 400,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize:'22px', fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
            {item.label}
          </button>
        );
      })}
    </nav>
  </>
);

// ─── Shared UI Components ─────────────────────────────────────────────────────
export const SkeletonBlock = ({ h = 16, w = '100%', r = 8 }) => (
  <div className="skeleton" style={{ height:h, width:w, borderRadius:r }} />
);

export const SkeletonCard = () => (
  <div style={{ background:'var(--surface-container-lowest)', border:'1px solid var(--outline-variant)', borderRadius:'12px', padding:'1.25rem', display:'flex', flexDirection:'column', gap:'10px' }}>
    <SkeletonBlock h={14} w="55%" />
    <SkeletonBlock h={11} />
    <SkeletonBlock h={11} w="80%" />
    <SkeletonBlock h={11} w="65%" />
  </div>
);

export const MarkdownContent = ({ content }) => (
  <div className="prose"><ReactMarkdown>{content}</ReactMarkdown></div>
);

export const Disclaimer = () => (
  <div style={{
    background:'var(--surface-container)', border:'1px solid var(--outline-variant)',
    borderRadius:'10px', padding:'0.75rem 1rem',
    display:'flex', alignItems:'flex-start', gap:'8px',
    fontSize:'0.78rem', color:'var(--on-surface-variant)', lineHeight:1.5,
  }}>
    <span className="material-symbols-outlined" style={{ fontSize:'16px', flexShrink:0, marginTop:'1px' }}>info</span>
    <span>Informasi ini hanya bersifat edukatif dan <strong>bukan pengganti konsultasi dokter</strong>. Hubungi layanan darurat <strong>119</strong> jika kondisi serius.</span>
  </div>
);

const SEVERITY_CFG = {
  low:       { label:'Urgensi Rendah', color:'var(--tertiary)',      bg:'var(--on-tertiary-container)', border:'var(--tertiary-fixed-dim)', icon:'check_circle' },
  medium:    { label:'Urgensi Sedang', color:'#92400E',              bg:'#FFFBEB',                       border:'#FDE68A',                    icon:'warning' },
  high:      { label:'Urgensi Tinggi', color:'#C2410C',              bg:'#FFF7ED',                       border:'#FED7AA',                    icon:'priority_high' },
  emergency: { label:'DARURAT',        color:'var(--error)',          bg:'var(--error-container)',         border:'#FECACA',                    icon:'emergency' },
};

export const SeverityBadge = ({ level }) => {
  const cfg = SEVERITY_CFG[level] || SEVERITY_CFG.low;
  return (
    <div style={{
      display:'inline-flex', alignItems:'center', gap:'5px',
      background:cfg.bg, border:`1px solid ${cfg.border}`,
      color:cfg.color, borderRadius:'999px',
      padding:'0.25rem 0.75rem', fontSize:'0.78rem', fontWeight:600,
      fontFamily:'var(--font-display)',
    }}>
      <span className="material-symbols-outlined" style={{ fontSize:'14px' }}>{cfg.icon}</span>
      {cfg.label}
    </div>
  );
};

export const TypingIndicator = () => (
  <div style={{ display:'flex', alignItems:'center', gap:'4px', padding:'0.5rem' }}>
    <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
  </div>
);

export const EmergencyOverlay = ({ onClose }) => (
  <div className="anim-fade-in" style={{
    position:'fixed', inset:0, zIndex:9999,
    background:'rgba(186,26,26,0.97)',
    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
    padding:'2rem', textAlign:'center', color:'white',
  }}>
    <span className="material-symbols-outlined" style={{ fontSize:'64px', marginBottom:'1rem', animation:'pulse-emergency 1.5s infinite' }}>emergency</span>
    <h1 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', fontWeight:800, marginBottom:'0.75rem' }}>DARURAT MEDIS</h1>
    <p style={{ fontSize:'1rem', opacity:0.9, marginBottom:'2rem', maxWidth:'420px', lineHeight:1.6 }}>
      Gejala yang kamu sebutkan mungkin kondisi darurat. Jangan tunda mencari pertolongan!
    </p>
    <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', justifyContent:'center', marginBottom:'2rem' }}>
      {[{num:'119',label:'Ambulans'},{num:'118',label:'PMI'}].map(e => (
        <a key={e.num} href={`tel:${e.num}`} style={{
          background:'white', color:'var(--error)',
          fontFamily:'var(--font-display)', fontWeight:800,
          fontSize:'1.6rem', padding:'1rem 2rem', borderRadius:'16px',
          textDecoration:'none', display:'flex', flexDirection:'column', alignItems:'center',
          boxShadow:'0 4px 20px rgba(0,0,0,0.25)',
        }}>
          📞 {e.num}
          <span style={{ fontSize:'0.75rem', fontWeight:500, marginTop:'2px' }}>{e.label}</span>
        </a>
      ))}
    </div>
    <p style={{ opacity:0.8, fontSize:'0.9rem', marginBottom:'1rem' }}>Atau pergi ke <strong>IGD Rumah Sakit</strong> terdekat</p>
    <button onClick={onClose} style={{
      background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)',
      color:'white', padding:'0.5rem 1.5rem', borderRadius:'10px',
      cursor:'pointer', fontSize:'0.85rem', fontFamily:'var(--font-body)',
    }}>Saya mengerti, tutup peringatan</button>
  </div>
);

export const EmptyState = ({ icon, title, desc }) => (
  <div style={{ textAlign:'center', padding:'3rem 1rem', color:'var(--on-surface-variant)' }}>
    <span className="material-symbols-outlined" style={{ fontSize:'48px', marginBottom:'1rem', display:'block', color:'var(--outline)' }}>{icon}</span>
    <h3 style={{ fontFamily:'var(--font-display)', color:'var(--on-surface)', marginBottom:'0.5rem', fontSize:'1rem' }}>{title}</h3>
    <p style={{ fontSize:'0.88rem' }}>{desc}</p>
  </div>
);

// ─── Shared card & button styles ──────────────────────────────────────────────
export const cardStyle = {
  background:'var(--surface-container-lowest)',
  border:'1px solid var(--outline-variant)',
  borderRadius:'12px',
  boxShadow:'0 1px 4px rgba(0,0,0,0.04)',
};

export const btnPrimary = {
  background:'var(--primary)', color:'white',
  border:'none', borderRadius:'999px',
  padding:'0.65rem 1.5rem',
  fontFamily:'var(--font-display)', fontWeight:600, fontSize:'0.88rem',
  cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'6px',
  transition:'all 0.15s',
};

export const inputStyle = {
  width:'100%', border:'1px solid var(--outline-variant)',
  borderRadius:'8px', padding:'0.7rem 1rem',
  fontFamily:'var(--font-body)', fontSize:'0.9rem',
  background:'var(--surface)', color:'var(--on-surface)',
  outline:'none', transition:'border-color 0.2s, box-shadow 0.2s',
};