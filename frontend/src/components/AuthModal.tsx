import { useState } from 'react';
import { X, Shield, User, Key, Mail, Loader2 } from 'lucide-react';
import { authService } from '../api';
import { useToast } from './Toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        if (!form.username) {
          setError('Username is required');
          setLoading(false);
          return;
        }
        const res = await authService.register(form);
        localStorage.setItem('evalforge_token', res.data.access_token);
        onAuthSuccess(res.data.user);
        addToast({
          type: 'success',
          title: 'OPERATOR REGISTERED',
          message: `Welcome, agent ${res.data.user.username}. Security clearance granted.`,
        });
      } else {
        const res = await authService.login({ email: form.email, password: form.password });
        localStorage.setItem('evalforge_token', res.data.access_token);
        onAuthSuccess(res.data.user);
        addToast({
          type: 'success',
          title: 'ACCESS GRANTED',
          message: `Welcome back, ${res.data.user.username}.`,
        });
      }
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Authentication failed. Please verify credentials.';
      setError(msg);
      addToast({ type: 'error', title: 'ACCESS DENIED', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="hud-panel corner-notch w-full max-w-md p-6 bg-[#0c0e16] border-2 border-zinc-800 relative">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-500" />
            <span className="font-gta text-xl tracking-wider text-zinc-100">
              {isRegister ? 'OPERATOR CLEARANCE REGISTRATION' : 'SECURITY CHECKPOINT // LOGIN'}
            </span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-mono">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-hud text-zinc-400 mb-1">OPERATOR EMAIL</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                className="gta-input pl-9"
                placeholder="agent@evalforge.dev"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-hud text-zinc-400 mb-1">CALLSIGN / USERNAME</label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required={isRegister}
                  className="gta-input pl-9"
                  placeholder="e.g., GhostRider"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-hud text-zinc-400 mb-1">SECURITY PASSPHRASE</label>
            <div className="relative">
              <Key className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                className="gta-input pl-9"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gta btn-gta-orange w-full justify-center mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                AUTHENTICATING...
              </>
            ) : isRegister ? (
              'CONFIRM REGISTRATION →'
            ) : (
              'ENTER SYSTEM →'
            )}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-zinc-900 flex justify-between items-center text-xs font-hud">
          <button
            type="button"
            className="text-orange-400 hover:underline"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
          >
            {isRegister ? '← BACK TO LOGIN' : 'NEW OPERATOR? REGISTER HERE'}
          </button>
          <span className="text-zinc-600 font-mono text-[10px]">SECURE // AES-256</span>
        </div>
      </div>
    </div>
  );
}
