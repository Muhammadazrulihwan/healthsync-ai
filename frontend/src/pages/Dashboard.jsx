import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { getDailyTips } from '../services/api';
import { SkeletonBlock, cardStyle, AI_AVATAR } from '../components/UI';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  if (h < 20) return 'Good Evening';
  return 'Good Night';
};

const QUICK_CARDS = [
  { id:'symptom',    icon:'medical_services', label:'Symptoms',   desc:'Analyze your symptoms',         color:'var(--primary)',   bg:'var(--primary-fixed)' },
  { id:'medication', icon:'medication',       label:'Medication', desc:'Search drug information',       color:'#7C3AED',          bg:'#F5F3FF' },
  { id:'chatbot',    icon:'chat_bubble',      label:'Chat',       desc:'Ask health questions',          color:'#0284C7',          bg:'#F0F9FF' },
  { id:'preventive', icon:'health_and_safety',label:'Preventive', desc:'Get wellness suggestions',      color:'var(--tertiary)',   bg:'var(--on-tertiary-container)' },
  { id:'wellness',   icon:'self_improvement', label:'Wellness',   desc:'Mental health support',       color:'#9333EA',         bg:'#FAF5FF' },
];

export default function Dashboard({ onNavigate }) {
  const [tips, setTips]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDailyTips('general')
      .then(d => setTips(d.tips))
      .catch(() => setTips(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="anim-stagger" style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>

      {/* Greeting hero card */}
      <div style={{
        background:'linear-gradient(135deg, var(--primary) 0%, #0041A8 100%)',
        borderRadius:'20px', padding:'2rem',
        display:'flex', justifyContent:'space-between', alignItems:'center',
        gap:'1rem', overflow:'hidden', position:'relative', minHeight:'160px',
      }}>
        {/* Background decorative circles */}
        <div style={{ position:'absolute', right:'-30px', top:'-30px', width:'180px', height:'180px', borderRadius:'50%', background:'rgba(255,255,255,0.06)' }} />
        <div style={{ position:'absolute', right:'80px', bottom:'-50px', width:'120px', height:'120px', borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />

        {/* Left: text */}
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'0.5rem' }}>
            <img src={AI_AVATAR} alt="HealthSync AI" style={{ width:40, height:40, borderRadius:'10px', border:'2px solid rgba(255,255,255,0.3)', background:'rgba(255,255,255,0.1)' }} />
            <span style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.7)', fontFamily:'var(--font-body)' }}>HealthSync AI</span>
          </div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.75rem', fontWeight:800, color:'white', marginBottom:'0.35rem' }}>
            {getGreeting()} 👋
          </h2>
          <p style={{ color:'rgba(255,255,255,0.8)', fontSize:'0.92rem', maxWidth:'380px', lineHeight:1.5 }}>
            Here is your health overview for today. How are you feeling?
          </p>
        </div>
      </div>

      {/* Quick access */}
      <div>
        <h3 style={{ fontFamily:'var(--font-display)', fontSize:'0.8rem', fontWeight:600, color:'var(--on-surface-variant)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.75rem' }}>
          Quick Access
        </h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:'0.75rem' }}>
          {QUICK_CARDS.map(card => (
            <button key={card.id} onClick={() => onNavigate(card.id)} style={{
              background:card.bg, border:`1px solid ${card.color}22`,
              borderRadius:'12px', padding:'1.1rem',
              cursor:'pointer', textAlign:'left', transition:'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize:'24px', color:card.color, marginBottom:'0.5rem', display:'block' }}>{card.icon}</span>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.9rem', color:card.color, marginBottom:'0.2rem' }}>{card.label}</div>
              <div style={{ fontSize:'0.78rem', color:'var(--on-surface-variant)', lineHeight:1.4 }}>{card.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Daily Tips */}
      <div style={{ ...cardStyle, padding:'1.5rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'1rem' }}>
          <span className="material-symbols-outlined" style={{ color:'var(--primary)', fontSize:'20px' }}>psychology</span>
          <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.95rem', color:'var(--on-surface)' }}>Daily Wellness Tips</h3>
          <span style={{
            marginLeft:'auto', background:'var(--secondary-container)',
            color:'var(--on-secondary-container)', fontSize:'0.7rem',
            fontWeight:600, padding:'0.2rem 0.6rem', borderRadius:'999px',
            textTransform:'uppercase', letterSpacing:'0.05em',
          }}>Today</span>
        </div>
        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {[...Array(4)].map((_, i) => <SkeletonBlock key={i} h={13} w={`${65+i*8}%`} />)}
          </div>
        ) : tips ? (
          <div className="prose" style={{ fontSize:'0.88rem' }}>
            <ReactMarkdown>{tips}</ReactMarkdown>
          </div>
        ) : (
          <p style={{ color:'var(--on-surface-variant)', fontSize:'0.88rem' }}>
            Failed to load tips. Please check your API connection.
          </p>
        )}
      </div>

      {/* Disclaimer */}
      <div style={{
        background:'var(--surface-container)', border:'1px solid var(--outline-variant)',
        borderRadius:'10px', padding:'0.75rem 1rem',
        display:'flex', alignItems:'flex-start', gap:'8px',
        fontSize:'0.78rem', color:'var(--on-surface-variant)', lineHeight:1.5,
      }}>
        <span className="material-symbols-outlined" style={{ fontSize:'16px', flexShrink:0, marginTop:'1px' }}>info</span>
        <span>HealthSync AI is not a substitute for professional medical advice. Always consult with a qualified healthcare provider for diagnosis and treatment.</span>
      </div>
    </div>
  );
}