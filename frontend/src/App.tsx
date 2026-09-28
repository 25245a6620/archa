

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Timeline from './components/timeline/Timeline';
import DecisionDetail from './components/timeline/DecisionDetail';
import ArchitectureMap from './components/architecture/ArchitectureMap';
import MemoryInspector from './components/memory/MemoryInspector';
import AskArcha from './components/agent/AskArcha';

function App() {
  return (
    <Router>
      <div style={{ fontFamily: 'system-ui, sans-serif' }}>
        {/* Navigation Bar */}
        <nav style={{ background: '#111827', color: 'white', padding: '1rem 2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>ARCHA</h1>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Architecture Memory & Decision Agent</div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 500 }}>Ask ARCHA</Link>
            <Link to="/architecture" style={{ color: 'white', textDecoration: 'none', fontWeight: 500 }}>Architecture Map</Link>
            <Link to="/timeline" style={{ color: 'white', textDecoration: 'none', fontWeight: 500 }}>Timeline</Link>
          </div>
        </nav>

        {/* Main Content Area */}
        <main>
          <Routes>
            <Route path="/" element={<AskArcha />} />
            <Route path="/ask" element={<AskArcha />} />
            <Route path="/architecture" element={<ArchitectureMap />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/timeline/:id" element={<DecisionDetail />} />
            <Route path="/memory" element={<MemoryInspector />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
