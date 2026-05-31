import { useState, useMemo } from 'react';
import { getMedicationInfo } from '../services/api';
import { MarkdownContent, SkeletonCard, Disclaimer, useToast, cardStyle, btnPrimary, inputStyle } from '../components/UI';

const CATEGORIES = [
  {
    icon: 'apps', label: 'All Medications',
    meds: []
  },
  {
    icon: 'health_and_safety', label: 'Pain Relief',
    meds: [
      { name:'Paracetamol', type:'OTC',          icon:'pill',          desc:'Common pain reliever and fever reducer.' },
      { name:'Ibuprofen',   type:'OTC',          icon:'pill',          desc:'Anti-inflammatory, pain, and fever reducer.' },
      { name:'Aspirin',     type:'OTC',          icon:'pill',          desc:'Pain reliever and blood thinner.' },
      { name:'Tramadol',    type:'Prescription', icon:'prescriptions', desc:'Opioid for moderate to severe pain.' },
    ]
  },
  {
    icon: 'prescriptions', label: 'Antibiotics',
    meds: [
      { name:'Amoxicillin',   type:'Prescription', icon:'prescriptions', desc:'Broad-spectrum penicillin antibiotic.' },
      { name:'Azithromycin',  type:'Prescription', icon:'prescriptions', desc:'Macrolide for respiratory infections.' },
      { name:'Ciprofloxacin', type:'Prescription', icon:'prescriptions', desc:'Fluoroquinolone for urinary infections.' },
      { name:'Doxycycline',   type:'Prescription', icon:'prescriptions', desc:'Tetracycline for various infections.' },
    ]
  },
  {
    icon: 'local_pharmacy', label: 'Allergy',
    meds: [
      { name:'Cetirizine',      type:'OTC',          icon:'medication_liquid', desc:'Non-drowsy antihistamine.' },
      { name:'Loratadine',      type:'OTC',          icon:'medication_liquid', desc:'Long-acting, non-sedating antihistamine.' },
      { name:'Diphenhydramine', type:'OTC',          icon:'medication_liquid', desc:'First-gen antihistamine, may cause drowsiness.' },
      { name:'Montelukast',     type:'Prescription', icon:'prescriptions',     desc:'For asthma and allergies.' },
    ]
  },
  {
    icon: 'favorite', label: 'Heart Health',
    meds: [
      { name:'Lisinopril',   type:'Prescription', icon:'vaccines', desc:'ACE inhibitor for hypertension.' },
      { name:'Amlodipine',   type:'Prescription', icon:'vaccines', desc:'Calcium channel blocker.' },
      { name:'Atorvastatin', type:'Prescription', icon:'science',  desc:'Statin for cholesterol reduction.' },
      { name:'Bisoprolol',   type:'Prescription', icon:'vaccines', desc:'Beta-blocker for heart rate.' },
    ]
  },
  {
    icon: 'bloodtype', label: 'Diabetes',
    meds: [
      { name:'Metformin',    type:'Prescription', icon:'science',  desc:'First-line oral diabetes medication.' },
      { name:'Glibenclamide',type:'Prescription', icon:'science',  desc:'Sulfonylurea to stimulate insulin.' },
      { name:'Insulin',      type:'Prescription', icon:'vaccines', desc:'Injectable for blood sugar control.' },
      { name:'Sitagliptin',  type:'Prescription', icon:'science',  desc:'DPP-4 inhibitor for type 2 diabetes.' },
    ]
  },
];

const ALL_MEDS = [
  ...new Map(
    CATEGORIES.slice(1).flatMap(c => c.meds).map(m => [m.name, m])
  ).values()
];
CATEGORIES[0].meds = ALL_MEDS;

const QUERY_TYPES = [
  { value:'general',      label:'General Info', icon:'info' },
  { value:'dosage',       label:'Dosage',        icon:'scale' },
  { value:'side_effects', label:'Side Effects',  icon:'warning' },
  { value:'interaction',  label:'Interactions',  icon:'link' },
];

export default function MedicationInfo() {
  const toast = useToast();
  const [search, setSearch]                 = useState('');
  const [queryType, setQueryType]           = useState('general');
  const [otherMeds, setOtherMeds]           = useState('');
  const [loading, setLoading]               = useState(false);
  const [result, setResult]                 = useState(null);
  const [activeCategory, setActiveCategory] = useState(0);

  const focusStyle = { borderColor:'var(--primary)', boxShadow:'0 0 0 3px rgba(0,88,188,0.12)' };
  const currentCat = CATEGORIES[activeCategory];

  const filteredMeds = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return currentCat.meds;
    return ALL_MEDS.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.desc.toLowerCase().includes(q)
    );
  }, [search, activeCategory]);

  const handleCategoryClick = (idx) => {
    setActiveCategory(idx);
    setResult(null);
    setSearch('');
  };

  // ── Fungsi fetch utama — dipakai oleh kartu, search bar, dan "Ask AI" ──────
  const fetchMedInfo = async (medicationName) => {
    // Validasi interaction: wajib isi otherMeds
    if (queryType === 'interaction' && !otherMeds.trim()) {
      toast('Isi field "Other medications" terlebih dahulu untuk cek interaksi.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const payload = { medication_name: medicationName, query_type: queryType };
      if (queryType === 'interaction' && otherMeds.trim()) {
        payload.other_medications = otherMeds.trim();
      }
      const data = await getMedicationInfo(payload);
      setResult(data);
    } catch(e) {
      toast(e.message || 'Failed to fetch medication info.');
    } finally {
      setLoading(false);
    }
  };

  // ── Klik tombol Search ────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!search.trim()) return toast('Enter a medication name first.');
    // Jika ada di library → fetch langsung
    const exact = ALL_MEDS.find(m => m.name.toLowerCase() === search.trim().toLowerCase());
    if (exact) { fetchMedInfo(exact.name); return; }
    // Tidak ada di library → tetap fetch ke API
    fetchMedInfo(search.trim());
  };

  return (
    <div style={{ display:'flex', gap:'1.5rem', alignItems:'flex-start' }}>

      {/* ── Sidebar ── */}
      <aside style={{ width:'200px', flexShrink:0 }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1rem', marginBottom:'0.75rem', color:'var(--on-surface)' }}>
          Categories
        </h2>
        <nav>
          <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:'2px' }}>
            {CATEGORIES.map((cat, i) => (
              <li key={cat.label}>
                <button onClick={() => handleCategoryClick(i)} style={{
                  width:'100%', textAlign:'left', display:'flex', alignItems:'center', gap:'8px',
                  padding:'0.55rem 0.75rem', borderRadius:'8px', border:'none', cursor:'pointer',
                  fontFamily:'var(--font-body)', fontSize:'0.85rem', transition:'all 0.15s',
                  background: activeCategory===i ? 'var(--primary-fixed)' : 'transparent',
                  color: activeCategory===i ? 'var(--on-primary-fixed-variant)' : 'var(--on-surface-variant)',
                  fontWeight: activeCategory===i ? 600 : 400,
                }}
                onMouseEnter={e => { if (activeCategory!==i) e.currentTarget.style.background='var(--surface-container)'; }}
                onMouseLeave={e => { if (activeCategory!==i) e.currentTarget.style.background='transparent'; }}>
                  <span className="material-symbols-outlined" style={{ fontSize:'18px' }}>{cat.icon}</span>
                  <span style={{ flex:1 }}>{cat.label}</span>
                  <span style={{ fontSize:'0.68rem', background:'var(--outline-variant)', color:'var(--on-surface-variant)', borderRadius:'999px', padding:'0 5px', minWidth:'18px', textAlign:'center' }}>
                    {i === 0 ? ALL_MEDS.length : cat.meds.length}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'1.25rem' }}>

        {/* Header */}
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:700, color:'var(--on-surface)' }}>
            {currentCat.label}
          </h1>
          <p style={{ color:'var(--on-surface-variant)', fontSize:'0.9rem', marginTop:'0.25rem' }}>
            {activeCategory === 0
              ? `Showing all ${ALL_MEDS.length} medications across all categories.`
              : `${currentCat.meds.length} medications in this category. Click a card to see full details.`}
          </p>
        </div>

        {/* Search bar */}
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
            <div style={{ position:'relative', flex:1, maxWidth:'520px' }}>
              <span className="material-symbols-outlined" style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'var(--outline)', fontSize:'20px' }}>search</span>
              <input
                style={{ ...inputStyle, paddingLeft:'44px', paddingRight:'36px', borderRadius:'999px', background:'var(--surface-container-lowest)', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}
                placeholder="Search medication name..."
                value={search}
                onChange={e => { setSearch(e.target.value); setResult(null); }}
                onKeyDown={e => e.key==='Enter' && handleSearch()}
                onFocus={e => Object.assign(e.target.style, focusStyle)}
                onBlur={e => { e.target.style.borderColor='var(--outline-variant)'; e.target.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'; }}
              />
              {search && (
                <button onClick={() => { setSearch(''); setResult(null); }} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'transparent', border:'none', cursor:'pointer', color:'var(--outline)', padding:'2px', display:'flex' }}>
                  <span className="material-symbols-outlined" style={{ fontSize:'18px' }}>close</span>
                </button>
              )}
            </div>
            <button onClick={handleSearch} disabled={loading} style={{ ...btnPrimary, borderRadius:'999px', padding:'0.55rem 1.25rem', fontSize:'0.85rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Query type chips */}
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            {QUERY_TYPES.map(qt => (
              <button key={qt.value} onClick={() => { setQueryType(qt.value); setResult(null); }} style={{
                padding:'0.35rem 0.85rem', borderRadius:'999px',
                border:`1px solid ${queryType===qt.value ? 'var(--primary)' : 'var(--outline-variant)'}`,
                background: queryType===qt.value ? 'var(--secondary-container)' : 'var(--surface)',
                color: queryType===qt.value ? 'var(--on-secondary-container)' : 'var(--on-surface-variant)',
                fontFamily:'var(--font-body)', fontSize:'0.8rem', fontWeight: queryType===qt.value ? 600 : 400,
                cursor:'pointer', transition:'all 0.15s',
                display:'flex', alignItems:'center', gap:'4px',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize:'14px' }}>{qt.icon}</span>
                {qt.label}
              </button>
            ))}
          </div>

          {/* Other medications field — hanya muncul saat Interactions dipilih */}
          {queryType === 'interaction' && (
            <div className="anim-fade-in" style={{ maxWidth:'480px' }}>
              <label style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:'0.8rem', color:'var(--on-surface)', display:'block', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                Other Medications <span style={{ color:'var(--error)' }}>*</span>
              </label>
              <input
                style={{ ...inputStyle, borderColor: otherMeds.trim() ? 'var(--primary)' : 'var(--outline-variant)' }}
                placeholder="e.g., Ibuprofen, Warfarin... (required for interaction check)"
                value={otherMeds}
                onChange={e => setOtherMeds(e.target.value)}
                onFocus={e => Object.assign(e.target.style, focusStyle)}
                onBlur={e => { e.target.style.borderColor = otherMeds.trim() ? 'var(--primary)' : 'var(--outline-variant)'; e.target.style.boxShadow='none'; }}
              />
              {!otherMeds.trim() && (
                <p style={{ fontSize:'0.75rem', color:'var(--error)', marginTop:'4px' }}>
                  ⚠️ Fill this field first, then click a medication card to check interaction.
                </p>
              )}
              {otherMeds.trim() && (
                <p style={{ fontSize:'0.75rem', color:'var(--tertiary)', marginTop:'4px' }}>
                  ✓ Ready — now click a medication card to check interaction with "{otherMeds}".
                </p>
              )}
            </div>
          )}
        </div>

        {/* Med card grid */}
        {!result && !loading && (
          <>
            {search.trim() && (
              <div style={{ fontSize:'0.82rem', color:'var(--on-surface-variant)', display:'flex', alignItems:'center', gap:'6px' }}>
                <span className="material-symbols-outlined" style={{ fontSize:'16px' }}>filter_list</span>
                {filteredMeds.length > 0
                  ? `${filteredMeds.length} result${filteredMeds.length>1?'s':''} for "${search}"`
                  : `No match for "${search}" — click Search to ask AI`}
              </div>
            )}

            <div className="anim-fade-in" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(190px, 1fr))', gap:'0.85rem' }}>
              {filteredMeds.map(med => (
                <article key={med.name}
                  style={{ ...cardStyle, padding:'1rem', cursor:'pointer', display:'flex', flexDirection:'column', gap:'0.65rem', transition:'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--primary-fixed-dim)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--outline-variant)'; e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.transform='none'; }}>
                  {/* Icon + badge */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--surface-container)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--primary)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize:'18px' }}>{med.icon}</span>
                    </div>
                    <span style={{
                      fontSize:'0.68rem', fontWeight:600, padding:'0.18rem 0.5rem', borderRadius:'999px',
                      background: med.type==='OTC' ? 'var(--on-tertiary-container)' : 'var(--secondary-container)',
                      color: med.type==='OTC' ? 'var(--tertiary)' : 'var(--on-secondary-container)',
                      display:'flex', alignItems:'center', gap:'3px',
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize:'11px' }}>{med.type==='OTC' ? 'check_circle' : 'info'}</span>
                      {med.type}
                    </span>
                  </div>

                  {/* Name + desc */}
                  <div>
                    <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.9rem', color:'var(--on-surface)', marginBottom:'0.2rem' }}>{med.name}</h3>
                    <p style={{ fontSize:'0.78rem', color:'var(--on-surface-variant)', lineHeight:1.4 }}>{med.desc}</p>
                  </div>

                  {/* ── View Details button — satu-satunya trigger fetch ── */}
                  <button
                    onClick={e => {
                      e.stopPropagation(); // cegah bubble ke article
                      fetchMedInfo(med.name);
                    }}
                    style={{ marginTop:'auto', width:'100%', background:'var(--surface-container)', color:'var(--primary)', border:'none', borderRadius:'6px', padding:'0.4rem', fontFamily:'var(--font-body)', fontSize:'0.8rem', fontWeight:500, cursor:'pointer', transition:'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background='var(--primary)'; e.currentTarget.style.color='white'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='var(--surface-container)'; e.currentTarget.style.color='var(--primary)'; }}>
                    {queryType === 'interaction' ? `Check Interaction` : 'View Details'}
                  </button>
                </article>
              ))}

              {filteredMeds.length === 0 && (
                <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'2.5rem', color:'var(--on-surface-variant)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize:'40px', display:'block', marginBottom:'0.5rem', color:'var(--outline)' }}>search_off</span>
                  <p style={{ fontSize:'0.9rem', marginBottom:'0.75rem' }}>No match in library for <strong>"{search}"</strong></p>
                  <button onClick={handleSearch} style={{ ...btnPrimary, fontSize:'0.85rem', borderRadius:'999px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize:'16px' }}>auto_awesome</span>
                    Ask AI about "{search}"
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Loading */}
        {loading && (
          <div className="anim-fade-in" style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <SkeletonCard/><SkeletonCard/>
          </div>
        )}

        {/* Detail result */}
        {result && !loading && (
          <div className="anim-fade-up" style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ ...cardStyle, padding:'1.5rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'1rem', paddingBottom:'1rem', borderBottom:'1px solid var(--outline-variant)' }}>
                <div style={{ width:40, height:40, background:'var(--secondary-container)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span className="material-symbols-outlined" style={{ color:'var(--on-secondary-container)', fontSize:'20px' }}>medication</span>
                </div>
                <div>
                  <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.05rem', color:'var(--on-surface)' }}>{result.medication_name}</h2>
                  <span style={{ fontSize:'0.78rem', color:'var(--on-surface-variant)' }}>
                    {QUERY_TYPES.find(q => q.value===queryType)?.label}
                    {queryType === 'interaction' && otherMeds && ` with ${otherMeds}`}
                  </span>
                </div>
                <button onClick={() => setResult(null)} style={{
                  marginLeft:'auto', display:'flex', alignItems:'center', gap:'5px',
                  background:'var(--surface-container)', border:'none', borderRadius:'999px',
                  padding:'0.4rem 0.85rem', cursor:'pointer', color:'var(--on-surface-variant)',
                  fontFamily:'var(--font-body)', fontSize:'0.82rem', transition:'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background='var(--surface-container-high)'}
                onMouseLeave={e => e.currentTarget.style.background='var(--surface-container)'}>
                  <span className="material-symbols-outlined" style={{ fontSize:'16px' }}>arrow_back</span>
                  Back
                </button>
              </div>
              <MarkdownContent content={result.information} />
            </div>
            <Disclaimer />
          </div>
        )}
      </div>
    </div>
  );
}