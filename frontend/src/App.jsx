import { useState, useEffect } from 'react';
import { Navbar, ToastProvider } from './components/UI';
import Dashboard from './pages/Dashboard';
import SymptomChecker from './pages/SymptomChecker';
import MedicationInfo from './pages/MedicationInfo';
import HealthChatbot from './pages/HealthChatbot';
import PreventiveCare from './pages/PreventiveCare';
import MentalWellness from './pages/MentalWellness';
import { checkApiHealth } from './services/api';

const PAGES = {
  dashboard:  Dashboard,
  symptom:    SymptomChecker,
  medication: MedicationInfo,
  chatbot:    HealthChatbot,
  preventive: PreventiveCare,
  wellness:   MentalWellness,
};

function AppContent() {
  const [activePage, setActivePage] = useState('dashboard');
  const [apiOnline, setApiOnline]   = useState(null);

  useEffect(() => {
    checkApiHealth()
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false));
  }, []);

  const PageComponent = PAGES[activePage] || Dashboard;

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <Navbar active={activePage} onNavigate={setActivePage} apiOnline={apiOnline} />

      {apiOnline === false && (
        <div style={{
          background:'var(--error-container)', borderBottom:'1px solid #FECACA',
          padding:'0.6rem 3rem', display:'flex', alignItems:'center', gap:'8px',
          fontSize:'0.85rem', color:'var(--on-error-container)',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize:'18px' }}>wifi_off</span>
          Backend API not detected. Make sure FastAPI is running at <strong style={{ marginLeft:'4px' }}>http://localhost:8000</strong>.
        </div>
      )}

      <main style={{
        flex:1,
        maxWidth:'1200px',
        width:'100%',
        margin:'0 auto',
        padding:'2rem 3rem',
        paddingBottom:'5rem',
      }}>
        <PageComponent onNavigate={setActivePage} key={activePage} />
      </main>

      <style>{`
        @media (max-width: 768px) {
          main { padding: 1rem 1rem 5rem !important; }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}