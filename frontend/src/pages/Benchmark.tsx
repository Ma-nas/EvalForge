import { useState } from 'react';
import {
  Swords, Loader2, Trophy, Clock, DollarSign, Sparkles, Download, Check
} from 'lucide-react';

import { benchmarkService, exportService } from '../api';
import { useToast } from '../components/Toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MODEL_OPTIONS = [
  { value: 'gemini', label: 'GEMINI 1.5 FLASH', tier: 'TIER 1 (RAPID)' },
  { value: 'gemini-1.5-pro', label: 'GEMINI 1.5 PRO', tier: 'TIER 2 (HEAVY)' },
  { value: 'openai', label: 'GPT-3.5 TURBO', tier: 'LEGACY' },
  { value: 'gpt-4o-mini', label: 'GPT-4O MINI', tier: 'TIER 1 (RAPID)' },
  { value: 'gpt-4o', label: 'GPT-4O', tier: 'TIER 3 (ELITE)' },
];

const BATTLE_SAMPLE = {
  prompt: 'Design an efficient algorithm to detect fraudulent transactions in real-time streaming data with low false-positive rates.',
  context: 'High-frequency payment processing stream handling 50,000 transactions per second. Fraud detection must complete within 20 milliseconds.',
  expected_output: 'Implement an ensemble model combining isolation forests with sliding-window velocity checks and an online XGBoost inference engine.',
};

export default function Benchmark() {
  const [form, setForm] = useState({ prompt: '', context: '', expected_output: '' });
  const [selectedModels, setSelectedModels] = useState<string[]>(['gemini', 'gpt-4o-mini']);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  const loadSample = () => {
    setForm(BATTLE_SAMPLE);
    setSelectedModels(['gemini', 'gpt-4o-mini', 'openai']);
    addToast({
      type: 'info',
      title: 'BATTLE SCENARIO LOADED',
      message: 'High-frequency fraud detection prompt armed.',
    });
  };

  const toggleModel = (model: string) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedModels.length === 0) {
      addToast({ type: 'warning', title: 'NO TARGETS SELECTED', message: 'Select at least one model for the shootout.' });
      return;
    }
    if (form.prompt.trim().length < 5) {
      addToast({ type: 'warning', title: 'INPUT ERROR', message: 'Prompt must be at least 5 characters.' });
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await benchmarkService.run({ ...form, models: selectedModels });
      setResult(res.data);
      addToast({
        type: 'success',
        title: 'BENCHMARK WARFARE CONCLUDED',
        message: `Champion: ${res.data.best_model} across ${res.data.results.length} models.`,
      });
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Benchmark failed.';
      setError(msg);
      addToast({ type: 'error', title: 'BENCHMARK ABORTED', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ─── Header ────────────────────────────────────────── */}
      <div className="border-b-2 border-zinc-800 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="stamp-badge stamp-verified text-xs">SECTOR-04 ARENA</span>
            <span className="font-hud text-xs text-orange-400">// MULTI-MODEL WARZONE</span>
          </div>
          <h1 className="gta-title text-5xl lg:text-6xl mt-1 tracking-wide">
            MODEL WARZONE BENCHMARK
          </h1>
          <p className="font-hud text-xs text-zinc-400 tracking-widest mt-1">
            HEAD-TO-HEAD COMPARISON • LATENCY BENCHMARKING • TOKEN COST CALCULATIONS
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadSample}
            className="btn-gta btn-gta-ghost text-xs px-4 py-2.5"
          >
            <Sparkles className="w-4 h-4 text-orange-400" /> LOAD BATTLE SCENARIO
          </button>
          {result && (
            <a
              href={exportService.getBenchmarksUrl('csv')}
              download
              className="btn-gta btn-gta-ghost text-xs px-4 py-2.5"
            >
              <Download className="w-4 h-4 text-emerald-400" /> EXPORT CSV
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ─── Input Form ──────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="hud-panel corner-notch p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <h3 className="font-gta text-2xl text-zinc-100 tracking-wider flex items-center gap-2">
              <Swords className="w-5 h-5 text-orange-500" /> ARENA PROMPT LOADOUT
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">HEAD-TO-HEAD</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-hud text-xs text-zinc-300">CHALLENGE PROMPT</label>
              <span className="font-mono text-[10px] text-zinc-500">{form.prompt.length} CHARS</span>
            </div>
            <textarea
              className="gta-input min-h-[80px] resize-y"
              placeholder="Enter the benchmark challenge prompt..."
              value={form.prompt}
              onChange={(e) => setForm({ ...form, prompt: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-hud text-xs text-zinc-300">CONTEXT (OPTIONAL)</label>
            <textarea
              className="gta-input min-h-[60px] resize-y"
              placeholder="Background context or scenario..."
              value={form.context}
              onChange={(e) => setForm({ ...form, context: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-hud text-xs text-zinc-300">EXPECTED ANSWER FOR ACCURACY SCORING (OPTIONAL)</label>
            <textarea
              className="gta-input min-h-[60px] resize-y"
              placeholder="Ground truth reference to calculate similarity..."
              value={form.expected_output}
              onChange={(e) => setForm({ ...form, expected_output: e.target.value })}
            />
          </div>

          {/* Model Selection Loadout */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-hud text-xs text-zinc-300">DEPLOYED MODELS ({selectedModels.length})</label>
              <span className="font-mono text-[10px] text-orange-400">SELECT TO ENGAGE</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MODEL_OPTIONS.map((opt) => {
                const isSelected = selectedModels.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleModel(opt.value)}
                    className={`p-3 text-left border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-zinc-850 border-orange-500 text-white'
                        : 'bg-black/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="font-gta text-lg tracking-wider leading-none">{opt.label}</div>
                      <div className="text-[10px] font-mono text-zinc-500 mt-1">{opt.tier}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-orange-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gta btn-gta-orange w-full justify-center mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                MODELS BATTLING...
              </>
            ) : (
              'LAUNCH BENCHMARK WAR →'
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-950/40 border-2 border-red-500/40 text-red-400 text-xs font-mono">
              ⚠️ {error}
            </div>
          )}
        </form>

        {/* ─── Results View ────────────────────────────────── */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Champion Card */}
              <div className="hud-panel p-6 border-2 border-orange-500/80 relative overflow-hidden bg-gradient-to-r from-[#0e111a] to-[#15101a]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-hud text-xs text-orange-400 tracking-widest flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-orange-400" />
                      WARZONE CHAMPION
                    </div>
                    <div className="gta-title-orange text-5xl mt-1 tracking-wide uppercase">
                      {result.best_model}
                    </div>
                  </div>
                  <span className="stamp-badge stamp-gold text-base">VICTOR</span>
                </div>
              </div>

              {/* Model Comparison Table */}
              <div className="hud-panel p-6">
                <h4 className="font-gta text-2xl text-zinc-100 tracking-wider mb-4">
                  BATTLE METRICS SUMMARY
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-hud text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400 bg-zinc-950/40">
                        <th className="p-2.5">MODEL</th>
                        <th className="p-2.5 text-right"><Clock className="w-3 h-3 inline mr-1" />LATENCY</th>
                        <th className="p-2.5 text-right"><DollarSign className="w-3 h-3 inline mr-1" />COST</th>
                        <th className="p-2.5 text-right">SIMILARITY</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850 font-mono">
                      {result.results.map((r: any, i: number) => (
                        <tr key={i} className="hover:bg-zinc-900/40">
                          <td className="p-2.5 font-gta text-base text-zinc-100 uppercase tracking-wide">
                            {r.model_name}
                            {r.error && <span className="ml-2 text-rose-500 text-[10px] font-hud">[ERROR]</span>}
                          </td>
                          <td className="p-2.5 text-right text-cyan-400 font-bold">{r.latency_ms.toFixed(0)}ms</td>
                          <td className="p-2.5 text-right text-orange-400">${r.cost_estimate?.toFixed(6) || '0.000000'}</td>
                          <td className="p-2.5 text-right text-emerald-400 font-bold">
                            {r.semantic_similarity ? (r.semantic_similarity * 100).toFixed(1) + '%' : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Latency Comparison Chart */}
              <div className="hud-panel p-6">
                <h4 className="font-gta text-2xl text-zinc-100 tracking-wider mb-4">
                  RESPONSE TIME SHOOTOUT (MS)
                </h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.results.filter((r: any) => !r.error)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2537" />
                    <XAxis dataKey="model_name" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Space Grotesk' }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
                    <Tooltip contentStyle={{ background: '#0a0d15', border: '2px solid #06b6d4', borderRadius: 0 }} />
                    <Bar dataKey="latency_ms" fill="#06b6d4" name="Latency (ms)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Model Output Transcripts */}
              <div className="hud-panel p-6 space-y-3">
                <h4 className="font-gta text-2xl text-zinc-100 tracking-wider">
                  GENERATED INTEL TRANSCRIPTS
                </h4>
                {result.results.map((r: any, i: number) => (
                  <div key={i} className="p-4 bg-black/60 border border-zinc-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-gta text-lg text-orange-400 tracking-wide uppercase">{r.model_name}</span>
                      <span className="text-[10px] font-mono text-zinc-500">{r.token_count || 0} TOKENS</span>
                    </div>
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      {r.error ? `Error: ${r.error}` : r.output?.slice(0, 320)}
                      {r.output?.length > 320 ? '...' : ''}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="hud-panel p-12 flex flex-col items-center justify-center text-center h-full min-h-[420px] border-dashed border-zinc-800">
              <Swords className="w-16 h-16 text-zinc-700 mb-4 opacity-40 animate-pulse" />
              <h3 className="font-gta text-3xl text-zinc-300 tracking-wide">
                ARENA EMPTY // NO FIGHTERS LOADED
              </h3>
              <p className="text-xs font-hud text-zinc-500 mt-2 max-w-sm">
                Select your LLM contenders and submit a challenge prompt, or click "LOAD BATTLE SCENARIO".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
