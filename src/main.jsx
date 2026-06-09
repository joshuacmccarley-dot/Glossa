import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Aegis from './Aegis.jsx'

function Root() {
  const [view, setView] = useState(() =>
    window.location.hash === '#aegis' ? 'aegis' : 'automater'
  );

  useEffect(() => {
    const onHash = () => setView(window.location.hash === '#aegis' ? 'aegis' : 'automater');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const goAegis     = () => { window.location.hash = '#aegis';     setView('aegis'); };
  const goAutomater = () => { window.location.hash = '#automater'; setView('automater'); };

  if (view === 'aegis') return <Aegis onBack={goAutomater} />;
  return <App onViewAegis={goAegis} />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
