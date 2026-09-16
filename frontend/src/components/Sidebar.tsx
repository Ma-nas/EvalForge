import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Target,
  Crosshair,
  Swords,
  Layers,
  Database,
  X,
  Radio,
} from 'lucide-react';


const navItems = [
  { to: '/', icon: LayoutDashboard, tag: '01', label: 'EVAL MATRIX' },
  { to: '/evaluate', icon: Target, tag: '02', label: 'ACCURACY BENCH' },
  { to: '/hallucination', icon: Crosshair, tag: '03', label: 'HALLUCINATION RADAR' },
  { to: '/benchmark', icon: Swords, tag: '04', label: 'MODEL WARZONE' },
  { to: '/rag', icon: Layers, tag: '05', label: 'RAG PIPELINE' },
  { to: '/datasets', icon: Database, tag: '06', label: 'DATA ARMORY' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-[#090b12] border-r-2 border-zinc-800 z-50 flex flex-col
        transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Top Brand Block */}
        <div className="p-6 border-b-2 border-zinc-800 bg-[#07080e] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-1 hazard-stripes" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 flex items-center justify-center text-black font-black font-gta text-2xl shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                EF
              </div>
              <div>
                <h1 className="gta-title text-3xl leading-none">EVALFORGE</h1>
                <p className="font-hud text-[10px] text-orange-400 tracking-widest mt-0.5">
                  RATE • ANALYZE • DOMINATE
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden text-zinc-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stamped Badge */}
          <div className="mt-4 flex items-center justify-between">
            <span className="stamp-badge stamp-verified text-xs">
              MIL-SPEC // VERIFIED
            </span>
            <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> V1.1.0
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="text-[10px] font-hud text-zinc-500 tracking-widest px-2 mb-2">
            MISSION DIRECTIVES
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 font-gta text-xl tracking-wider transition-all duration-150 border ${
                  isActive
                    ? 'bg-zinc-850 text-white border-orange-500 shadow-[inset_4px_0_0_#f97316]'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border-transparent hover:border-zinc-800'
                }`
              }
            >
              <span className="text-xs font-mono text-orange-500 tracking-normal opacity-80">
                {item.tag}
              </span>
              <item.icon className="w-4 h-4 text-zinc-300" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer info card */}
        <div className="p-4 border-t-2 border-zinc-800 bg-[#07080e]">
          <div className="p-3 bg-zinc-900/60 border border-zinc-800">
            <div className="flex justify-between items-center text-[10px] font-hud text-zinc-400 mb-1">
              <span>TARGET LOCK</span>
              <span className="text-emerald-400 font-bold">100% READY</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-full w-[100%]" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
