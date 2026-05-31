import { useState } from 'react';
import { getPreventiveSuggestions } from '../services/api';
import { MarkdownContent, SkeletonCard, Disclaimer, EmptyState, useToast, cardStyle, btnPrimary, inputStyle } from '../components/UI';

const LIFESTYLE_OPTIONS = [
  { value:'active',    label:'Active',    icon:'directions_run', desc:'Regular exercise' },
  { value:'moderate',  label:'Moderate',  icon:'directions_walk', desc:'Occasional exercise' },
  { value:'sedentary', label:'Sedentary', icon:'weekend',         desc:'Rarely active' },
];

const KONDISI = [
  { value:'merokok',        label:'Smoking',        icon:'smoking_rooms' },
  { value:'kurang tidur',   label:'Poor Sleep',      icon:'bedtime' },
  { value:'stress tinggi',  label:'High Stress',     icon:'psychology' },
  { value:'obesitas',       label:'Overweight',      icon:'monitor_weight' },
  { value:'konsumsi alkohol',label:'Alcohol',        icon:'local_bar' },
];

const TUJUAN = [
  { value:'turunkan berat badan',   label:'Lose Weight',      icon:'trending_down' },
  { value:'tingkatkan imunitas',    label:'Boost Immunity',   icon:'shield' },
  { value:'kelola stres',           label:'Manage Stress',    icon:'spa' },
  { value:'perbaiki pola tidur',    label:'Better Sleep',     icon:'bedtime' },
  { value:'jaga kesehatan jantung', label:'Heart Health',     icon:'favorite' },
  { value:'cegah diabetes',         label:'Prevent Diabetes', icon:'bloodtype' },
];

export default function PreventiveCare() {
  const toast = useToast();
  const [form, setForm]       = useState({ age:'', gender:'', topic:'', lifestyle:'moderate' });
  const [kondisi, setKondisi] = useState([]);
  const [tujuan, setTujuan]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);

  const focusStyle = { borderColor:'var(--primary)', boxShadow:'0 0 0 3px rgba(0,88,188,0.12)' };

  const toggle = (arr, setArr, v) =>
    setArr(p => p.includes(v) ? p.filter(x=>x!==v) : [...p, v]);

  const handleSubmit = async () => {
    setLoading(true); setResult(null);
    try {
      const lifestyleInfo = [
        `Activity level: ${form.lifestyle}`,
        kondisi.length ? `Conditions: ${kondisi.join(', ')}` : null,
        tujuan.length  ? `Goals: ${tujuan.join(', ')}` : null,
        form.topic     ? `Focus: ${form.topic}` : null,
      ].filter(Boolean).join('. ');

      const payload = { topic: form.topic || 'general health', lifestyle_info: lifestyleInfo };
      if (form.age)    payload.age    = parseInt(form.age);
      if (form.gender) payload.gender = form.gender;

      const data = await getPreventiveSuggestions(payload);
      setResult(data);
    } catch(e) {
      toast(e.message || 'Failed to get suggestions.');
    } finally {
      setLoading(false);
    }
  };

  const ChipGroup = ({ items, selected, onToggle, colorKey='primary' }) => (
    <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
      {items.map(item => {
        const active = selected.includes(item.value);
        return (
          <button key={item.value} onClick={() => onToggle(item.value)} style={{
            display:'flex', alignItems:'center', gap:'5px',
            padding:'0.4rem 0.85rem', borderRadius:'999px',
            border:`1px solid ${active ? 'var(--primary)' : 'var(--outline-variant)'}`,
            background: active ? 'var(--secondary-container)' : 'var(--surface)',
            color: active ? 'var(--on-secondary-container)' : 'var(--on-surface-variant)',
            fontFamily:'var(--font-body)', fontSize:'0.83rem', fontWeight: active ? 600 : 400,
            cursor:'pointer', transition:'all 0.15s',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize:'15px' }}>{item.icon}</span>
            {item.label}
          </button>
        );
      })}
    </div>
  );

  const labelStyle = { fontFamily:'var(--font-display)', fontWeight:600, fontSize:'0.8rem', color:'var(--on-surface)', display:'block', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.05em' };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
      <div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:700 }}>Preventive Care</h1>
        <p style={{ color:'var(--on-surface-variant)', marginTop:'0.3rem', fontSize:'0.9rem' }}>
          Get personalized health prevention advice based on your profile and lifestyle.
        </p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', alignItems:'start' }}>

        {/* Left: Personal info */}
        <div style={{ ...cardStyle, padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1.1rem' }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.95rem', color:'var(--on-surface)' }}>Personal Profile</h3>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div>
              <label style={labelStyle}>Age</label>
              <input style={inputStyle} type="number" placeholder="Years" min={0} max={120}
                value={form.age} onChange={e => setForm({...form, age:e.target.value})}
                onFocus={e => Object.assign(e.target.style, focusStyle)}
                onBlur={e => { e.target.style.borderColor='var(--outline-variant)'; e.target.style.boxShadow='none'; }} />
            </div>
            <div>
              <label style={labelStyle}>Gender</label>
              <select style={{ ...inputStyle, appearance:'none' }}
                value={form.gender} onChange={e => setForm({...form, gender:e.target.value})}
                onFocus={e => Object.assign(e.target.style, focusStyle)}
                onBlur={e => { e.target.style.borderColor='var(--outline-variant)'; e.target.style.boxShadow='none'; }}>
                <option value="">Select (optional)</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Focus Topic (optional)</label>
            <input style={inputStyle} placeholder="e.g., hypertension prevention, healthy diet..."
              value={form.topic} onChange={e => setForm({...form, topic:e.target.value})}
              onFocus={e => Object.assign(e.target.style, focusStyle)}
              onBlur={e => { e.target.style.borderColor='var(--outline-variant)'; e.target.style.boxShadow='none'; }} />
          </div>

          <div>
            <label style={labelStyle}>Activity Level</label>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {LIFESTYLE_OPTIONS.map(opt => (
                <label key={opt.value} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'0.6rem 0.75rem', borderRadius:'8px', cursor:'pointer', border:`1px solid ${form.lifestyle===opt.value ? 'var(--primary)' : 'var(--outline-variant)'}`, background: form.lifestyle===opt.value ? 'var(--primary-fixed)' : 'transparent', transition:'all 0.15s' }}>
                  <input type="radio" name="lifestyle" value={opt.value} checked={form.lifestyle===opt.value}
                    onChange={() => setForm({...form, lifestyle:opt.value})}
                    style={{ accentColor:'var(--primary)' }} />
                  <span className="material-symbols-outlined" style={{ fontSize:'18px', color: form.lifestyle===opt.value ? 'var(--primary)' : 'var(--on-surface-variant)' }}>{opt.icon}</span>
                  <div>
                    <div style={{ fontFamily:'var(--font-body)', fontSize:'0.88rem', fontWeight: form.lifestyle===opt.value ? 600 : 400, color:'var(--on-surface)' }}>{opt.label}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--on-surface-variant)' }}>{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Conditions + Goals */}
        <div style={{ ...cardStyle, padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1.1rem' }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.95rem', color:'var(--on-surface)' }}>Conditions & Goals</h3>

          <div>
            <label style={labelStyle}>Current Conditions / Habits</label>
            <ChipGroup items={KONDISI} selected={kondisi} onToggle={v => toggle(kondisi, setKondisi, v)} />
          </div>

          <div>
            <label style={labelStyle}>Health Goals</label>
            <ChipGroup items={TUJUAN} selected={tujuan} onToggle={v => toggle(tujuan, setTujuan, v)} />
          </div>

          <div style={{ marginTop:'auto' }}>
            <button onClick={handleSubmit} disabled={loading} style={{ ...btnPrimary, width:'100%', justifyContent:'center', padding:'0.75rem', opacity: loading ? 0.7 : 1, borderRadius:'10px' }}>
              <span className="material-symbols-outlined" style={{ fontSize:'18px' }}>health_and_safety</span>
              {loading ? 'Getting Suggestions...' : 'Get My Personalized Plan'}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="anim-fade-in" style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <SkeletonCard/><SkeletonCard/>
        </div>
      )}

      {!loading && !result && (
        <EmptyState icon="health_and_safety" title="No suggestions yet" desc="Fill in your profile above and click 'Get My Personalized Plan'." />
      )}

      {result && !loading && (
        <div className="anim-fade-up" style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div style={{ ...cardStyle, padding:'1.5rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'1rem' }}>
              <div style={{ width:36, height:36, background:'var(--on-tertiary-container)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span className="material-symbols-outlined" style={{ color:'var(--tertiary)', fontSize:'20px' }}>health_and_safety</span>
              </div>
              <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.05rem' }}>Your Personalized Health Plan</h2>
            </div>
            <MarkdownContent content={result.recommendations} />
          </div>
          <Disclaimer />
        </div>
      )}
    </div>
  );
}
