import { NavLink } from 'react-router-dom';
import { Flame, BarChart3, Shield, GitCompare, Database, Cpu } from 'lucide-react';

const navItems = [
  { to: '/', icon: BarChart3, label: 'Dashboard' },
  { to: '/evaluate', icon: Cpu, label: 'Evaluate' },
  { to: '/hallucination', icon: Shield, label: 'Hallucination' },
  { to: '/benchmark', icon: GitCompare, label: 'Benchmark' },
  { to: '/rag', icon: Database, label: 'RAG' },
  { to: '/datasets', icon: Database, label: 'Datasets' },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 glass border-r border-white/5 z-50 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold gradient-text">EvalForge</h1>
          <p className="text-[10px] text-text-muted tracking-wider uppercase">LLM Evaluation Engine</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-accent-primary/15 text-accent-primary border border-accent-primary/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/5">
        <p className="text-xs text-text-muted">v1.0.0 • Production</p>
      </div>
    </aside>
  );
}
