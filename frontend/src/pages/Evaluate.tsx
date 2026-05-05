import { useState } from 'react';
import { Cpu, Send, Loader2 } from 'lucide-react';
import { evaluateService } from '../api';
import ScoreCard from '../components/ScoreCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Evaluate() {
  const [form, setForm] = useState({ prompt: '', context: '', expected_output: '', actual_output: '', model_name: '' });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await evaluateService.single(form);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Evaluation failed. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = result ? [
    { metric: 'Semantic Sim', score: +(result.semantic_similarity * 100).toFixed(1), fill: '#6366f1' },
    { metric: 'Relevance', score: +(result.relevance_score * 100).toFixed(1), fill: '#8b5cf6' },
    { metric: 'Groundedness', score: +(result.groundedness_score * 100).toFixed(1), fill: '#06b6d4' },
    { metric: 'Composite', score: +(result.composite_score * 100).toFixed(1), fill: '#10b981' },
  ] : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3"><Cpu className="w-8 h-8" /> LLM Evaluation</h1>
        <p className="text-text-secondary mt-1">Evaluate LLM outputs for semantic accuracy, relevance, and hallucination</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
          <h3 className="text-lg font-semibold text-text-primary">Evaluation Input</h3>

          <div className="space-y-2">
            <label className="text-sm text-text-secondary">Prompt</label>
            <textarea className="input-glass min-h-[80px] resize-y" placeholder="Enter the prompt sent to the LLM..."
              value={form.prompt} onChange={e => setForm({...form, prompt: e.target.value})} required />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-text-secondary">Context <span className="text-text-muted">(optional)</span></label>
            <textarea className="input-glass min-h-[80px] resize-y" placeholder="Reference document or context..."
              value={form.context} onChange={e => setForm({...form, context: e.target.value})} />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-text-secondary">Expected Output</label>
            <textarea className="input-glass min-h-[80px] resize-y" placeholder="Ground truth / expected answer..."
              value={form.expected_output} onChange={e => setForm({...form, expected_output: e.target.value})} required />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-text-secondary">Actual LLM Output</label>
            <textarea className="input-glass min-h-[80px] resize-y" placeholder="The LLM's actual response..."
              value={form.actual_output} onChange={e => setForm({...form, actual_output: e.target.value})} required />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-text-secondary">Model Name <span className="text-text-muted">(optional)</span></label>
            <input className="input-glass" placeholder="e.g., gemini-1.5-flash"
              value={form.model_name} onChange={e => setForm({...form, model_name: e.target.value})} />
          </div>

          <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Evaluating...</> : <><Send className="w-4 h-4" /> Run Evaluation</>}
          </button>

          {error && <div className="p-4 rounded-xl bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-sm">{error}</div>}
        </form>

        {/* Results */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Score Cards */}
              <div className="grid grid-cols-2 gap-4">
                <ScoreCard title="Semantic Similarity" value={result.semantic_similarity} icon={<span>🎯</span>} color="#6366f1" />
                <ScoreCard title="Relevance" value={result.relevance_score} icon={<span>📊</span>} color="#8b5cf6" />
                <ScoreCard title="Hallucination" value={result.hallucination_score} icon={<span>🚨</span>} color="#f43f5e" subtitle="Lower is better" />
                <ScoreCard title="Composite Score" value={result.composite_score} icon={<span>⭐</span>} color="#10b981" />
              </div>

              {/* Quality Label */}
              <div className="glass-card p-5 text-center">
                <span className="text-sm text-text-muted">Quality Rating</span>
                <div className={`text-2xl font-bold mt-1 ${
                  result.quality_label === 'Excellent' ? 'text-accent-emerald' :
                  result.quality_label === 'Good' ? 'text-accent-primary' :
                  result.quality_label === 'Fair' ? 'text-accent-amber' : 'text-accent-rose'
                }`}>
                  {result.quality_label}
                </div>
              </div>

              {/* Flags */}
              <div className="glass-card p-5 space-y-2">
                <h4 className="text-sm font-medium text-text-secondary">Flags</h4>
                {result.flags.map((flag: string, i: number) => (
                  <div key={i} className="text-sm text-text-primary bg-white/5 rounded-lg px-4 py-2">{flag}</div>
                ))}
              </div>

              {/* Bar Chart */}
              <div className="glass-card p-6">
                <h4 className="text-sm font-medium text-text-secondary mb-4">Score Breakdown</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: '#0f1420', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, i) => (
                        <Bar key={i} dataKey="score" fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <Cpu className="w-16 h-16 text-text-muted mb-4 opacity-30" />
              <h3 className="text-xl font-semibold text-text-secondary">No Results Yet</h3>
              <p className="text-sm text-text-muted mt-2 max-w-sm">Fill in the form and run an evaluation to see detailed quality metrics and visualizations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
