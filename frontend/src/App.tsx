import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import Dashboard from './pages/Dashboard';
import Evaluate from './pages/Evaluate';
import Hallucination from './pages/Hallucination';
import Benchmark from './pages/Benchmark';
import RAG from './pages/RAG';
import Datasets from './pages/Datasets';
import { authService } from './api';
import './index.css';

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Check for existing authenticated session
    const token = localStorage.getItem('evalforge_token');
    if (token) {
      authService
        .me()
        .then((res) => setCurrentUser(res.data))
        .catch(() => {
          localStorage.removeItem('evalforge_token');
          setCurrentUser(null);
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('evalforge_token');
    setCurrentUser(null);
  };

  return (
    <div className="flex min-h-screen bg-map-grid text-zinc-100 relative selection:bg-orange-500 selection:text-black">
      {/* Film grain texture */}
      <div className="film-grain" />

      {/* Navigation Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        {/* Top HUD Navbar */}
        <Navbar
          onOpenSidebar={() => setIsSidebarOpen(true)}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Dynamic Route Pages */}
        <main className="flex-1 p-4 md:p-8 relative z-10 max-w-7xl w-full mx-auto">
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

      {/* Security Checkpoint / Operator Login Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => setCurrentUser(user)}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <MainLayout />
      </ToastProvider>
    </Router>
  );
}
