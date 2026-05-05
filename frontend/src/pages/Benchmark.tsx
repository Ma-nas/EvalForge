import { useState } from 'react';
import { GitCompare, Send, Loader2, Trophy, Clock, DollarSign } from 'lucide-react';
import { benchmarkService } from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MODEL_OPTIONS = [
  { value: 'gemini', label: 'Gemini 1.5 Flash' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
  { value: 'openai', label: 'GPT-3.5 Turbo' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'gpt-4o', label: 'GPT-4o' },
];

export default function Benchmark() {
  const [form, setForm] = useState({ prompt: '', context: '', expected_output: '' });
  const [selectedModels, setSelectedModels] = useState<string[]>(['gemini']);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleModel = (model: string) => {
    setSelectedModels(prev => prev.includes(model) ? prev.filter(m => m !== model) : [...prev, model]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedModels.length === 0) { setError('Select at least one model'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await benchmarkService.run({ ...form, models: selectedModels });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Benchmark failed. Make sure the backend is running and API keys are configured.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3"><GitCompare className="w-8 h-8" /> Model Benchmarking</h1>
        <p className="text-text-secondary mt-1">Compare multiple LLMs across accuracy, latency, and cost</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
          <h3 className="text-lg font-semibold text-text-primary">Benchmark Input</h3>

          <div className="space-y-2">
            <label className="text-sm text-text-secondary">Prompt</label>
            <textarea className="input-glass min-h-[80px] resize-y" placeholder="Enter the prompt to benchmark..."
              value={form.prompt} onChange={e => setForm({...form, prompt: e.target.value})} required />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-text-secondary">Context <span className="text-text-muted">(optional)</span></label>
            <textarea className="input-glass min-h-[60px] resize-y" placeholder="Optional context..."
              value={form.context} onChange={e => setForm({...form, context: e.target.value})} />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-text-secondary">Expected Output <span className="text-text-muted">(optional)</span></label>
            <textarea className="input-glass min-h-[60px] resize-y" placeholder="Optional expected answer for accuracy comparison..."
              value={form.expected_output} onChange={e => setForm({...form, expected_output: e.target.value})} />
          </div>

          {/* Model Selector */}
          <div className="space-y-3">
            <label className="text-sm text-text-secondary">Select Models</label>
            <div className="flex flex-wrap gap-2">
              {MODEL_OPTIONS.map(opt => (
                <button key={opt.value} type="button"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedModels.includes(opt.value)
                      ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
                      : 'bg-white/5 text-text-secondary border border-white/5 hover:border-white/20'
                  }`}
                  onClick={() => toggleModel(opt.value)}
                >{opt.label}</button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Benchmarking...</> : <><Send className="w-4 h-4" /> Run Benchmark</>}
          </button>
          {error && <div className="p-4 rounded-xl bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-sm">{error}</div>}
        </form>

        <div className="space-y-6">
          {result ? (
            <>
              {/* Best Model */}
              <div className="glass-card p-6 text-center gradient-border rounded-2xl">
                <Trophy className="w-8 h-8 text-accent-amber mx-auto mb-2" />
                <div className="text-sm text-text-muted">Best Model</div>
                <div className="text-2xl font-bold text-accent-primary mt-1">{result.best_model}</div>
              </div>

              {/* Results Table */}
              <div className="glass-card p-6">
                <h4 className="text-sm font-medium text-text-secondary mb-4">Model Results</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-text-muted border-b border-white/5">
                        <th className="pb-3 text-left">Model</th>
                        <th className="pb-3 text-right"><Clock className="w-3 h-3 inline" /> Latency</th>
                        <th className="pb-3 text-right"><DollarSign className="w-3 h-3 inline" /> Cost</th>
                        <th className="pb-3 text-right">Similarity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {result.results.map((r: any, i: number) => (
                        <tr key={i} className="text-text-primary">
                          <td className="py-3 font-medium">{r.model_name}{r.error && <span className="text-accent-rose text-xs ml-2">Error</span>}</td>
                          <td className="py-3 text-right text-accent-cyan">{r.latency_ms.toFixed(0)}ms</td>
                          <td className="py-3 text-right text-accent-amber">${r.cost_estimate?.toFixed(6) || 'N/A'}</td>
                          <td className="py-3 text-right text-accent-emerald">{r.semantic_similarity ? (r.semantic_similarity * 100).toFixed(1) + '%' : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Latency Comparison Chart */}
              <div className="glass-card p-6">
                <h4 className="text-sm font-medium text-text-secondary mb-4">Latency Comparison</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.results.filter((r: any) => !r.error)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="model_name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#0f1420', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                    <Bar dataKey="latency_ms" fill="#06b6d4" radius={[8, 8, 0, 0]} name="Latency (ms)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Model Outputs */}
              <div className="glass-card p-6 space-y-3">
                <h4 className="text-sm font-medium text-text-secondary">Model Outputs</h4>
                {result.results.map((r: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 space-y-1">
                    <div className="text-sm font-medium text-accent-primary">{r.model_name}</div>
                    <p className="text-sm text-text-secondary">{r.error ? `Error: ${r.error}` : r.output?.slice(0, 300) || 'No output'}{r.output?.length > 300 ? '...' : ''}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <GitCompare className="w-16 h-16 text-text-muted mb-4 opacity-30" />
              <h3 className="text-xl font-semibold text-text-secondary">No Results Yet</h3>
              <p className="text-sm text-text-muted mt-2 max-w-sm">Select models and provide a prompt to compare performance.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
