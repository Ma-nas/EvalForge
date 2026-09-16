import { Menu, User as UserIcon, LogOut, Compass } from 'lucide-react';

interface NavbarProps {
  onOpenSidebar: () => void;
  currentUser: any;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export default function Navbar({
  onOpenSidebar,
  currentUser,
  onOpenAuth,
  onLogout,
}: NavbarProps) {
  return (
    <header className="h-16 border-b-2 border-zinc-800 bg-[#080a10]/95 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile menu toggle + HUD Coordinates */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          title="Open Menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden sm:flex items-center gap-3 font-hud text-xs text-zinc-400 border-l border-zinc-800 pl-4">
          <span className="flex items-center gap-1.5 text-zinc-300">
            <Compass className="w-3.5 h-3.5 text-orange-500 animate-spin-slow" />
            <span className="font-mono text-[11px] tracking-wider text-orange-400">
              34.0522° N, 118.2437° W
            </span>
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400 font-mono tracking-widest text-[11px]">
            SECTOR: LS-07
          </span>
        </div>
      </div>

      {/* Right: System Status & Operator Profile */}
      <div className="flex items-center gap-4">
        {/* Radar ping */}
        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-none text-[11px] font-hud">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-400 font-bold tracking-wider">SYSTEM ACTIVE</span>
        </div>

        {/* User / Operator Button */}
        {currentUser ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/80 border border-zinc-700">
              <div className="w-6 h-6 bg-orange-600 flex items-center justify-center font-gta text-black font-bold text-xs">
                {currentUser.username?.[0]?.toUpperCase() || 'O'}
              </div>
              <span className="font-hud text-xs text-zinc-200 uppercase tracking-wider">
                {currentUser.username}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-850 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-4 py-1.5 font-gta text-base tracking-wider bg-zinc-850 hover:bg-orange-500 hover:text-black text-zinc-200 border border-zinc-700 hover:border-orange-400 transition-all cursor-pointer"
          >
            <UserIcon className="w-4 h-4" />
            <span>OPERATOR LOGIN</span>
          </button>
        )}
      </div>
    </header>
  );
}
