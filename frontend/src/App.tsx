import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Evaluate from './pages/Evaluate';
import Hallucination from './pages/Hallucination';
import Benchmark from './pages/Benchmark';
import RAG from './pages/RAG';
import Datasets from './pages/Datasets';
import './index.css';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-dark-950 bg-grid">
        {/* Background glow effects */}
        <div className="bg-glow" />
        <div className="bg-glow-2" />

        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="ml-64 flex-1 p-8 relative z-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/evaluate" element={<Evaluate />} />
            <Route path="/hallucination" element={<Hallucination />} />
            <Route path="/benchmark" element={<Benchmark />} />
            <Route path="/rag" element={<RAG />} />
            <Route path="/datasets" element={<Datasets />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
