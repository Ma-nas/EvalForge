import { useState } from 'react';
import { Database, Send, Loader2, Plus, Minus } from 'lucide-react';
import { ragService } from '../api';
import ScoreCard from '../components/ScoreCard';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

export default function RAG() {
  const [form, setForm] = useState({ query: '', generated_output: '', ground_truth: '' });
  const [contexts, setContexts] = useState(['']);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addContext = () => setContexts([...contexts, '']);
  const removeContext = (i: number) => setContexts(contexts.filter((_, idx) => idx !== i));
  const updateContext = (i: number, val: string) => {
    const copy = [...contexts];
    copy[i] = val;
    setContexts(copy);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validContexts = contexts.filter(c => c.trim());
    if (validContexts.length === 0) { setError('Add at least one context'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await ragService.evaluate({
        ...form,
        retrieved_contexts: validContexts,
        ground_truth: form.ground_truth || undefined,
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'RAG evaluation failed.');
    } finally {
      setLoading(false);
    }
  };

  const radarData = result ? [
    { metric: 'Retrieval Prec.', value: +(result.retrieval_precision * 100).toFixed(1) },
    { metric: 'Context Rel.', value: +(result.context_relevance * 100).toFixed(1) },
    { metric: 'Answer Rel.', value: +(result.answer_relevance * 100).toFixed(1) },
    { metric: 'Groundedness', value: +(result.groundedness_score * 100).toFixed(1) },
    { metric: 'Faithfulness', value: +(result.faithfulness_score * 100).toFixed(1) },
  ] : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3"><Database className="w-8 h-8" /> RAG Evaluation</h1>
        <p className="text-text-secondary mt-1">Evaluate retrieval quality, context relevance, and generation faithfulness</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
          <h3 className="text-lg font-semibold text-text-primary">RAG Pipeline Input</h3>

          <div className="space-y-2">
            <label className="text-sm text-text-secondary">User Query</label>
            <textarea className="input-glass min-h-[70px] resize-y" placeholder="The user's original query..."
              value={form.query} onChange={e => setForm({...form, query: e.target.value})} required />
          </div>

          {/* Retrieved Contexts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-text-secondary">Retrieved Contexts ({contexts.length})</label>
              <button type="button" onClick={addContext} className="btn-ghost py-1 px-3 text-xs flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            {contexts.map((ctx, i) => (
              <div key={i} className="flex gap-2">
                <textarea className="input-glass min-h-[60px] resize-y flex-1" placeholder={`Context chunk ${i + 1}...`}
                  value={ctx} onChange={e => updateContext(i, e.target.value)} />
                {contexts.length > 1 && (
                  <button type="button" onClick={() => removeContext(i)} className="text-text-muted hover:text-accent-rose transition-colors self-start mt-3">
                    <Minus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-text-secondary">Generated Output</label>
            <textarea className="input-glass min-h-[80px] resize-y" placeholder="The RAG-generated answer..."
              value={form.generated_output} onChange={e => setForm({...form, generated_output: e.target.value})} required />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-text-secondary">Ground Truth <span className="text-text-muted">(optional)</span></label>
            <textarea className="input-glass min-h-[60px] resize-y" placeholder="Expected correct answer..."
              value={form.ground_truth} onChange={e => setForm({...form, ground_truth: e.target.value})} />
          </div>

          <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Evaluating...</> : <><Send className="w-4 h-4" /> Evaluate RAG Pipeline</>}
          </button>
          {error && <div className="p-4 rounded-xl bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-sm">{error}</div>}
        </form>

        <div className="space-y-6">
          {result ? (
            <>
              {/* Composite Score */}
              <div className="glass-card p-6 text-center">
                <div className="text-sm text-text-muted mb-2">Composite RAG Score</div>
                <div className={`text-5xl font-bold ${result.composite_rag_score > 0.7 ? 'text-accent-emerald' : result.composite_rag_score > 0.4 ? 'text-accent-amber' : 'text-accent-rose'}`}>
                  {(result.composite_rag_score * 100).toFixed(1)}%
                </div>
              </div>

              {/* Score Cards */}
              <div className="grid grid-cols-2 gap-4">
                <ScoreCard title="Retrieval Precision" value={result.retrieval_precision} icon={<span>🎯</span>} color="#6366f1" />
                <ScoreCard title="Context Relevance" value={result.context_relevance} icon={<span>📄</span>} color="#8b5cf6" />
                <ScoreCard title="Faithfulness" value={result.faithfulness_score} icon={<span>🤝</span>} color="#10b981" />
                <ScoreCard title="Groundedness" value={result.groundedness_score} icon={<span>🏗️</span>} color="#06b6d4" />
              </div>

              {/* Radar Chart */}
              <div className="glass-card p-6">
                <h4 className="text-sm font-medium text-text-secondary mb-4">RAG Quality Radar</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Radar dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                    <Tooltip contentStyle={{ background: '#0f1420', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Flags */}
              <div className="glass-card p-5 space-y-2">
                <h4 className="text-sm font-medium text-text-secondary mb-3">Analysis Flags</h4>
                {result.flags.map((flag: string, i: number) => (
                  <div key={i} className="text-sm text-text-primary bg-white/5 rounded-lg px-4 py-2.5">{flag}</div>
                ))}
              </div>
            </>
          ) : (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <Database className="w-16 h-16 text-text-muted mb-4 opacity-30" />
              <h3 className="text-xl font-semibold text-text-secondary">No Results Yet</h3>
              <p className="text-sm text-text-muted mt-2 max-w-sm">Provide query, retrieved contexts, and generated output to evaluate your RAG pipeline.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
