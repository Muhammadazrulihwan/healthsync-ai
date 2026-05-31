import { useState } from 'react';
import { checkSymptoms, symptomFollowup } from '../services/api';
import { SeverityBadge, Disclaimer, MarkdownContent, EmergencyOverlay, SkeletonCard, useToast, cardStyle, btnPrimary, inputStyle } from '../components/UI';

const DURATION_OPTIONS = ['< 1 Day', '1–3 Days', '1 Week', '> 1 Week'];

export default function SymptomChecker() {
  const toast = useToast();
  const [form, setForm]             = useState({ symptoms:'', duration:'', age:'', gender:'', existing_conditions:'' });
  const [selectedDuration, setDur]  = useState('');
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState(null);
  const [showEmergency, setShowEmergency] = useState(false);
  const [followupInput, setFollowupInput] = useState('');
  const [followupLoading, setFULoading]   = useState(false);
  const [followupHistory, setFUHistory]   = useState([]);

  const focusStyle = { borderColor:'var(--primary)', boxShadow:'0 0 0 3px rgba(0,88,188,0.12)' };

  const handleSubmit = async () => {
    if (!form.symptoms.trim()) return toast('Please describe your symptoms first.');
    setLoading(true); setResult(null); setFUHistory([]);
    try {
      const payload = { symptoms: form.symptoms };
      if (selectedDuration) payload.duration = selectedDuration;
      if (form.age)   payload.age    = parseInt(form.age);
      if (form.gender) payload.gender = form.gender;
      if (form.existing_conditions) payload.existing_conditions = form.existing_conditions;
      const data = await checkSymptoms(payload);
      setResult(data);
      if (data.is_emergency) setShowEmergency(true);
    } catch(e) {
      toast(e.message || 'Failed to analyze symptoms.');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowup = async () => {
    if (!followupInput.trim() || !result?.session_id) return;
    const question = followupInput.trim();
    setFollowupInput('');
    setFULoading(true);
    setFUHistory(p => [...p, { role:'user', content:question }]);
    try {
      const data = await symptomFollowup({ question, session_id: result.session_id });
      setFUHistory(p => [...p, { role:'assistant', content:data.response }]);
    } catch(e) {
      toast(e.message || 'Failed to send follow-up.');
      setFUHistory(p => p.slice(0,-1));
    } finally {
      setFULoading(false);
    }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
      {showEmergency && <EmergencyOverlay onClose={() => setShowEmergency(false)} />}

      <div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:700 }}>Describe Your Symptoms</h1>
        <p style={{ color:'var(--on-surface-variant)', marginTop:'0.3rem', fontSize:'0.9rem' }}>
          Provide details to get an accurate preliminary assessment. This is not a substitute for professional medical advice.
        </p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:'1.5rem', alignItems:'start' }}>

        {/* Left: Form */}
        <div style={{ ...cardStyle, padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1.1rem' }}>
          {/* Age + Gender */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div>
              <label style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:'0.8rem', color:'var(--on-surface)', display:'block', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Age</label>
              <div style={{ position:'relative' }}>
                <span className="material-symbols-outlined" style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', fontSize:'18px', color:'var(--outline)' }}>calendar_month</span>
                <input style={{ ...inputStyle, paddingLeft:'36px' }} type="number" placeholder="e.g. 25" min={0} max={120}
                  value={form.age} onChange={e => setForm({...form, age:e.target.value})}
                  onFocus={e => Object.assign(e.target.style, focusStyle)}
                  onBlur={e => { e.target.style.borderColor='var(--outline-variant)'; e.target.style.boxShadow='none'; }} />
              </div>
            </div>
            <div>
              <label style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:'0.8rem', color:'var(--on-surface)', display:'block', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Biological Sex</label>
              <div style={{ position:'relative' }}>
                <span className="material-symbols-outlined" style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', fontSize:'18px', color:'var(--outline)' }}>wc</span>
                <select style={{ ...inputStyle, paddingLeft:'36px', appearance:'none' }}
                  value={form.gender} onChange={e => setForm({...form, gender:e.target.value})}
                  onFocus={e => Object.assign(e.target.style, focusStyle)}
                  onBlur={e => { e.target.style.borderColor='var(--outline-variant)'; e.target.style.boxShadow='none'; }}>
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Primary Symptom */}
          <div>
            <label style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:'0.8rem', color:'var(--on-surface)', display:'block', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
              Primary Symptom <span style={{ color:'var(--error)' }}>*</span>
            </label>
            <div style={{ position:'relative' }}>
              <span className="material-symbols-outlined" style={{ position:'absolute', left:'10px', top:'12px', fontSize:'18px', color:'var(--outline)' }}>edit_note</span>
              <textarea style={{ ...inputStyle, paddingLeft:'36px', minHeight:'90px', resize:'vertical' }}
                placeholder="Describe your main symptom in detail..."
                value={form.symptoms} onChange={e => setForm({...form, symptoms:e.target.value})}
                onFocus={e => Object.assign(e.target.style, focusStyle)}
                onBlur={e => { e.target.style.borderColor='var(--outline-variant)'; e.target.style.boxShadow='none'; }} />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:'0.8rem', color:'var(--on-surface)', display:'block', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Duration</label>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {DURATION_OPTIONS.map(d => (
                <button key={d} onClick={() => setDur(selectedDuration === d ? '' : d)} style={{
                  padding:'0.45rem 1rem', borderRadius:'8px',
                  border:`1px solid ${selectedDuration===d ? 'var(--primary-container)' : 'var(--outline-variant)'}`,
                  background: selectedDuration===d ? 'var(--primary-container)' : 'var(--surface)',
                  color: selectedDuration===d ? 'var(--on-primary-container)' : 'var(--on-surface-variant)',
                  fontFamily:'var(--font-body)', fontSize:'0.85rem', cursor:'pointer', transition:'all 0.15s',
                }}>{d}</button>
              ))}
            </div>
          </div>

          {/* Existing conditions */}
          <div>
            <label style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:'0.8rem', color:'var(--on-surface)', display:'block', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Medical History (optional)</label>
            <textarea style={{ ...inputStyle, minHeight:'60px', resize:'vertical' }}
              placeholder="e.g., diabetes, hypertension, asthma..."
              value={form.existing_conditions} onChange={e => setForm({...form, existing_conditions:e.target.value})}
              onFocus={e => Object.assign(e.target.style, focusStyle)}
              onBlur={e => { e.target.style.borderColor='var(--outline-variant)'; e.target.style.boxShadow='none'; }} />
          </div>
        </div>

        {/* Right: Action panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem', minWidth:'220px' }}>
          {/* AI Assessment card */}
          <div style={{ background:'var(--primary-container)', borderRadius:'12px', padding:'1.25rem', color:'var(--on-primary-container)', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', right:'-15px', top:'-15px', opacity:0.08 }}>
              <span className="material-symbols-outlined" style={{ fontSize:'100px' }}>psychiatry</span>
            </div>
            <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1rem', marginBottom:'0.5rem', position:'relative' }}>AI Assessment</h3>
            <p style={{ fontSize:'0.8rem', opacity:0.85, lineHeight:1.5, marginBottom:'1rem', position:'relative' }}>
              Our AI will analyze your inputs and suggest potential causes and next steps.
            </p>
            <button onClick={handleSubmit} disabled={loading} style={{
              ...btnPrimary,
              background:'var(--surface-container-lowest)', color:'var(--primary)',
              width:'100%', justifyContent:'center', position:'relative',
              opacity: loading ? 0.7 : 1,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize:'18px' }}>analytics</span>
              {loading ? 'Analyzing...' : 'Check Now'}
            </button>
          </div>

          {/* Emergency warning */}
          <div style={{ background:'var(--error-container)', border:'1px solid rgba(186,26,26,0.2)', borderRadius:'12px', padding:'1rem', display:'flex', gap:'8px', alignItems:'flex-start' }}>
            <span className="material-symbols-outlined" style={{ color:'var(--error)', fontSize:'20px', marginTop:'1px' }}>emergency</span>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.8rem', color:'var(--error)', marginBottom:'4px' }}>Emergency Warning</div>
              <p style={{ fontSize:'0.78rem', color:'var(--on-error-container)', lineHeight:1.5 }}>
                If you have severe chest pain, difficulty breathing, or sudden numbness, call <strong>119</strong> immediately.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="anim-fade-in" style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <SkeletonCard /><SkeletonCard />
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="anim-fade-up" style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div style={{ ...cardStyle, padding:'1.5rem' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem', flexWrap:'wrap', gap:'0.5rem' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.05rem' }}>Assessment Result</h2>
              <SeverityBadge level={result.severity_level} />
            </div>
            <MarkdownContent content={result.analysis} />
          </div>

          <Disclaimer />

          {/* Follow-up */}
          <div style={{ ...cardStyle, padding:'1.25rem' }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:'0.9rem', color:'var(--on-surface-variant)', marginBottom:'1rem' }}>
              Have a follow-up question?
            </h3>
            {followupHistory.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.65rem', marginBottom:'1rem' }}>
                {followupHistory.map((msg, i) => (
                  <div key={i} style={{
                    padding:'0.65rem 0.9rem', borderRadius:'10px',
                    background: msg.role==='user' ? 'var(--secondary-container)' : 'var(--surface-container-low)',
                    border: '1px solid var(--outline-variant)',
                    fontSize:'0.88rem', lineHeight:1.6,
                    alignSelf: msg.role==='user' ? 'flex-end' : 'flex-start',
                    maxWidth:'85%',
                  }}>
                    {msg.role==='assistant' ? <MarkdownContent content={msg.content} /> : msg.content}
                  </div>
                ))}
                {followupLoading && (
                  <div style={{ padding:'0.5rem 0.9rem', background:'var(--surface-container-low)', border:'1px solid var(--outline-variant)', borderRadius:'10px', alignSelf:'flex-start' }}>
                    <div style={{ display:'flex', gap:'4px', alignItems:'center' }}>
                      <div className="typing-dot"/><div className="typing-dot"/><div className="typing-dot"/>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div style={{ display:'flex', gap:'8px' }}>
              <input style={{ ...inputStyle, flex:1 }} placeholder="Ask a follow-up question..."
                value={followupInput} onChange={e => setFollowupInput(e.target.value)}
                onKeyDown={e => e.key==='Enter' && handleFollowup()}
                disabled={followupLoading}
                onFocus={e => Object.assign(e.target.style, { borderColor:'var(--primary)', boxShadow:'0 0 0 3px rgba(0,88,188,0.12)' })}
                onBlur={e => { e.target.style.borderColor='var(--outline-variant)'; e.target.style.boxShadow='none'; }} />
              <button onClick={handleFollowup} disabled={followupLoading||!followupInput.trim()} style={{
                ...btnPrimary, borderRadius:'8px', padding:'0.7rem 1.1rem', flexShrink:0,
                opacity: (followupLoading||!followupInput.trim()) ? 0.6 : 1,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize:'18px' }}>send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
