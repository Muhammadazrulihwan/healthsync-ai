import { useState } from 'react';
import { sendChat } from '../services/api';
import { MarkdownContent, SkeletonCard, Disclaimer, useToast, cardStyle, btnPrimary, inputStyle } from '../components/UI';

const MOOD_OPTIONS = [
  { value: 5, emoji: '😄', label: 'Great',   color: '#16A34A', bg: '#F0FDF4' },
  { value: 4, emoji: '🙂', label: 'Good',    color: '#2563EB', bg: '#EFF6FF' },
  { value: 3, emoji: '😐', label: 'Okay',    color: '#D97706', bg: '#FFFBEB' },
  { value: 2, emoji: '😔', label: 'Low',     color: '#EA580C', bg: '#FFF7ED' },
  { value: 1, emoji: '😢', label: 'Bad',     color: '#DC2626', bg: '#FEF2F2' },
];

const QUICK_TOPICS = [
  { icon: 'self_improvement', label: 'Cara mengelola stres',         prompt: 'Berikan tips praktis untuk mengelola stres sehari-hari' },
  { icon: 'bedtime',          label: 'Tips tidur lebih baik',        prompt: 'Tips untuk meningkatkan kualitas dan pola tidur' },
  { icon: 'favorite',         label: 'Mindfulness & meditasi',       prompt: 'Cara memulai mindfulness dan meditasi untuk pemula' },
  { icon: 'directions_run',   label: 'Olahraga untuk mental',        prompt: 'Bagaimana olahraga membantu kesehatan mental?' },
  { icon: 'group',            label: 'Hubungan sosial yang sehat',   prompt: 'Tips membangun dan menjaga hubungan sosial yang sehat' },
  { icon: 'psychology',       label: 'Mengatasi kecemasan',          prompt: 'Cara mengatasi kecemasan dan serangan panik' },
  { icon: 'wb_sunny',         label: 'Berpikir positif',             prompt: 'Teknik untuk melatih pola pikir positif' },
  { icon: 'spa',              label: 'Relaksasi & pernapasan',       prompt: 'Teknik pernapasan dan relaksasi untuk menenangkan pikiran' },
];

const WELLNESS_TOOLS = [
  {
    icon: 'timer',
    title: '4-7-8 Breathing',
    desc: 'Teknik pernapasan untuk meredakan stres dan kecemasan secara cepat.',
    color: '#0058BC',
    bg: '#EFF6FF',
    steps: ['Tarik napas selama 4 detik', 'Tahan napas selama 7 detik', 'Hembuskan selama 8 detik', 'Ulangi 4 kali'],
  },
  {
    icon: 'psychology_alt',
    title: '5-4-3-2-1 Grounding',
    desc: 'Teknik grounding untuk kembali ke momen sekarang saat cemas.',
    color: '#7C3AED',
    bg: '#F5F3FF',
    steps: ['5 hal yang bisa kamu lihat', '4 hal yang bisa kamu sentuh', '3 hal yang bisa kamu dengar', '2 hal yang bisa kamu cium', '1 hal yang bisa kamu rasakan'],
  },
  {
    icon: 'edit_note',
    title: 'Journaling Prompt',
    desc: 'Tuliskan perasaanmu untuk memproses emosi dengan lebih baik.',
    color: '#059669',
    bg: '#F0FDF4',
    steps: ['Apa yang membuatmu stres hari ini?', 'Apa 3 hal yang kamu syukuri?', 'Apa yang bisa kamu kendalikan?', 'Apa yang ingin kamu lepaskan?'],
  },
];

const MENTAL_HEALTH_SYSTEM_PROMPT = `Kamu adalah konselor kesehatan mental AI yang empatik dan suportif.
Berikan dukungan emosional, edukasi kesehatan mental, dan teknik self-help berbasis bukti dalam Bahasa Indonesia.

ATURAN PENTING:
1. Selalu empati dan tidak menghakimi
2. Berikan informasi psikologi yang akurat dan berbasis bukti
3. Untuk kasus serius (pikiran menyakiti diri, dll), selalu sarankan profesional
4. Tidak mendiagnosis kondisi mental
5. Gunakan bahasa yang hangat dan mudah dipahami
6. Sertakan teknik praktis yang bisa langsung diterapkan`;

export default function MentalWellness() {
  const toast = useToast();
  const [selectedMood, setSelectedMood]   = useState(null);
  const [concern, setConcern]             = useState('');
  const [loading, setLoading]             = useState(false);
  const [result, setResult]               = useState(null);
  const [activeTool, setActiveTool]       = useState(null);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathStep, setBreathStep]       = useState(0);
  const [breathPhase, setBreathPhase]     = useState('inhale');

  const focusStyle = { borderColor:'var(--primary)', boxShadow:'0 0 0 3px rgba(0,88,188,0.12)' };

  const handleGetSupport = async (promptOverride = null) => {
    const message = promptOverride || concern.trim();
    if (!message) return toast('Ceritakan apa yang kamu rasakan terlebih dahulu.');
    setLoading(true);
    setResult(null);
    try {
      const moodContext = selectedMood
        ? `Mood saat ini: ${MOOD_OPTIONS.find(m => m.value === selectedMood)?.label}. `
        : '';
      const fullMessage = moodContext + message;
      const data = await sendChat({
        message: fullMessage,
        conversation_history: [],
        session_id: null,
      });
      setResult(data.response);
    } catch(e) {
      toast(e.message || 'Gagal mendapatkan dukungan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Breathing exercise timer
  const startBreathing = () => {
    setBreathingActive(true);
    setBreathStep(0);
    setBreathPhase('inhale');
    const phases = [
      { phase: 'Tarik Napas...', duration: 4000 },
      { phase: 'Tahan...', duration: 7000 },
      { phase: 'Hembuskan...', duration: 8000 },
    ];
    let i = 0;
    const run = () => {
      if (i >= phases.length * 4) { setBreathingActive(false); setBreathPhase('Selesai! 🎉'); return; }
      const p = phases[i % phases.length];
      setBreathPhase(p.phase);
      setBreathStep(i % phases.length);
      i++;
      setTimeout(run, p.duration);
    };
    run();
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:700, color:'var(--on-surface)' }}>
          🧠 Mental Wellness
        </h1>
        <p style={{ color:'var(--on-surface-variant)', marginTop:'0.3rem', fontSize:'0.9rem' }}>
          Ruang aman untuk mendukung kesehatan mental dan emosionalmu.
        </p>
      </div>

      {/* Mood Check-in */}
      <div style={{ ...cardStyle, padding:'1.5rem' }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1rem', marginBottom:'0.25rem' }}>
          Bagaimana perasaanmu hari ini?
        </h2>
        <p style={{ fontSize:'0.85rem', color:'var(--on-surface-variant)', marginBottom:'1rem' }}>
          Pilih mood yang paling menggambarkan kondisimu saat ini.
        </p>
        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
          {MOOD_OPTIONS.map(mood => (
            <button key={mood.value} onClick={() => setSelectedMood(mood.value)} style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:'4px',
              padding:'0.75rem 1.1rem', borderRadius:'12px', border:'none', cursor:'pointer',
              background: selectedMood === mood.value ? mood.bg : 'var(--surface-container)',
              outline: selectedMood === mood.value ? `2px solid ${mood.color}` : 'none',
              transition:'all 0.15s',
            }}
            onMouseEnter={e => { if (selectedMood !== mood.value) e.currentTarget.style.background = mood.bg; }}
            onMouseLeave={e => { if (selectedMood !== mood.value) e.currentTarget.style.background = 'var(--surface-container)'; }}>
              <span style={{ fontSize:'2rem' }}>{mood.emoji}</span>
              <span style={{ fontSize:'0.75rem', fontWeight:600, color: selectedMood === mood.value ? mood.color : 'var(--on-surface-variant)' }}>
                {mood.label}
              </span>
            </button>
          ))}
        </div>
        {selectedMood && (
          <p className="anim-fade-in" style={{ marginTop:'0.75rem', fontSize:'0.85rem', color:'var(--on-surface-variant)' }}>
            {selectedMood <= 2
              ? '💙 Terima kasih sudah jujur. Ceritakan lebih lanjut apa yang kamu rasakan di bawah, saya siap mendengarkan.'
              : selectedMood === 3
              ? '😊 Okay adalah valid! Ada yang ingin kamu explore lebih lanjut hari ini?'
              : '🌟 Senang mendengarnya! Tetap jaga kondisimu ya.'}
          </p>
        )}
      </div>

      {/* Two column: Quick topics + Get support */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', alignItems:'start' }}>

        {/* Quick topics */}
        <div style={{ ...cardStyle, padding:'1.5rem' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1rem', marginBottom:'0.25rem' }}>
            Topik Kesehatan Mental
          </h2>
          <p style={{ fontSize:'0.85rem', color:'var(--on-surface-variant)', marginBottom:'1rem' }}>
            Klik topik untuk mendapatkan panduan langsung dari AI.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            {QUICK_TOPICS.map(topic => (
              <button key={topic.label} onClick={() => handleGetSupport(topic.prompt)} style={{
                display:'flex', alignItems:'center', gap:'10px',
                padding:'0.65rem 0.85rem', borderRadius:'10px',
                border:'1px solid var(--outline-variant)', background:'var(--surface)',
                cursor:'pointer', textAlign:'left', transition:'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background='var(--secondary-container)'; e.currentTarget.style.borderColor='var(--primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='var(--surface)'; e.currentTarget.style.borderColor='var(--outline-variant)'; }}>
                <span className="material-symbols-outlined" style={{ fontSize:'18px', color:'var(--primary)', flexShrink:0 }}>{topic.icon}</span>
                <span style={{ fontFamily:'var(--font-body)', fontSize:'0.85rem', color:'var(--on-surface)' }}>{topic.label}</span>
                <span className="material-symbols-outlined" style={{ fontSize:'16px', color:'var(--outline)', marginLeft:'auto' }}>chevron_right</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom concern input */}
        <div style={{ ...cardStyle, padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1rem' }}>
            Ceritakan Perasaanmu
          </h2>
          <p style={{ fontSize:'0.85rem', color:'var(--on-surface-variant)' }}>
            Tulis apa yang sedang kamu rasakan atau pikirkan. Ini ruang aman untukmu.
          </p>
          <textarea
            style={{ ...inputStyle, minHeight:'120px', resize:'vertical' }}
            placeholder="Contoh: Saya merasa cemas dan khawatir tentang pekerjaan belakangan ini, sulit tidur dan sulit konsentrasi..."
            value={concern}
            onChange={e => setConcern(e.target.value)}
            onFocus={e => Object.assign(e.target.style, focusStyle)}
            onBlur={e => { e.target.style.borderColor='var(--outline-variant)'; e.target.style.boxShadow='none'; }}
          />
          <button onClick={() => handleGetSupport()} disabled={loading || !concern.trim()} style={{
            ...btnPrimary, justifyContent:'center',
            opacity: (loading || !concern.trim()) ? 0.6 : 1,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize:'18px' }}>
              {loading ? 'hourglass_empty' : 'support_agent'}
            </span>
            {loading ? 'Memproses...' : 'Dapatkan Dukungan AI'}
          </button>

          {/* Crisis resources */}
          <div style={{ background:'var(--error-container)', border:'1px solid rgba(186,26,26,0.2)', borderRadius:'10px', padding:'0.85rem', display:'flex', gap:'8px', alignItems:'flex-start' }}>
            <span className="material-symbols-outlined" style={{ color:'var(--error)', fontSize:'18px', flexShrink:0, marginTop:'1px' }}>emergency</span>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.8rem', color:'var(--error)', marginBottom:'3px' }}>
                Butuh bantuan segera?
              </div>
              <p style={{ fontSize:'0.78rem', color:'var(--on-error-container)', lineHeight:1.5 }}>
                Hubungi <strong>119 ext 8</strong> (Hotline Kemenkes) atau <strong>021-500-454</strong> (Into The Light) jika kamu membutuhkan bantuan profesional segera.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="anim-fade-in" style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <SkeletonCard/><SkeletonCard/>
        </div>
      )}

      {/* AI Response */}
      {result && !loading && (
        <div className="anim-fade-up" style={{ ...cardStyle, padding:'1.5rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'1rem', paddingBottom:'1rem', borderBottom:'1px solid var(--outline-variant)' }}>
            <div style={{ width:40, height:40, background:'var(--secondary-container)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span className="material-symbols-outlined" style={{ color:'var(--on-secondary-container)', fontSize:'20px' }}>psychology</span>
            </div>
            <div>
              <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1rem', color:'var(--on-surface)' }}>
                Dukungan dari HealthSync AI
              </h2>
              <span style={{ fontSize:'0.78rem', color:'var(--on-surface-variant)' }}>Mental Wellness Support</span>
            </div>
            <button onClick={() => setResult(null)} style={{ marginLeft:'auto', background:'transparent', border:'none', cursor:'pointer', color:'var(--on-surface-variant)' }}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <MarkdownContent content={result} />
        </div>
      )}

      {result && !loading && <Disclaimer />}

      {/* Wellness Tools */}
      <div>
        <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1rem', marginBottom:'0.75rem', color:'var(--on-surface)' }}>
          🛠️ Wellness Tools
        </h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'1rem' }}>
          {WELLNESS_TOOLS.map((tool, i) => (
            <div key={tool.title} style={{ ...cardStyle, padding:'1.25rem', display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ width:38, height:38, borderRadius:'10px', background:tool.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span className="material-symbols-outlined" style={{ color:tool.color, fontSize:'20px' }}>{tool.icon}</span>
                </div>
                <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.95rem', color:'var(--on-surface)' }}>{tool.title}</h3>
              </div>
              <p style={{ fontSize:'0.82rem', color:'var(--on-surface-variant)', lineHeight:1.5 }}>{tool.desc}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                {tool.steps.map((step, j) => (
                  <div key={j} style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'0.82rem', color:'var(--on-surface)' }}>
                    <div style={{ width:20, height:20, borderRadius:'50%', background:tool.bg, border:`1px solid ${tool.color}44`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span style={{ fontSize:'0.65rem', fontWeight:700, color:tool.color }}>{j+1}</span>
                    </div>
                    {step}
                  </div>
                ))}
              </div>

              {/* Breathing exercise interactive */}
              {i === 0 && (
                <div style={{ marginTop:'0.5rem' }}>
                  {!breathingActive ? (
                    <button onClick={startBreathing} style={{ ...btnPrimary, fontSize:'0.82rem', borderRadius:'8px', width:'100%', justifyContent:'center', background:tool.color }}>
                      <span className="material-symbols-outlined" style={{ fontSize:'16px' }}>play_arrow</span>
                      Mulai Latihan
                    </button>
                  ) : (
                    <div style={{ background:tool.bg, border:`1px solid ${tool.color}33`, borderRadius:'10px', padding:'1rem', textAlign:'center' }}>
                      <div style={{ fontSize:'1.5rem', fontWeight:700, color:tool.color, marginBottom:'4px' }}>{breathPhase}</div>
                      <div style={{ display:'flex', justifyContent:'center', gap:'6px' }}>
                        {['Tarik', 'Tahan', 'Hembus'].map((p, j) => (
                          <div key={p} style={{ width:8, height:8, borderRadius:'50%', background: breathStep === j ? tool.color : tool.bg, border:`1px solid ${tool.color}` }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Disclaimer />
    </div>
  );
}
