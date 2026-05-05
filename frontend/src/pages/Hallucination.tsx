import { useState } from 'react';
import { Shield, Send, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { hallucinationService } from '../api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function Hallucination() {
  const [form, setForm] = useState({ context: '', output: '', prompt: '' });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await hallucinationService.detect(form);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Detection failed. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const pieData = result ? [
    { name: 'Supported', value: result.supported_claims, color: '#10b981' },
    { name: 'Unsupported', value: result.unsupported_claims, color: '#f43f5e' },
  ] : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3"><Shield className="w-8 h-8" /> Hallucination Detection</h1>
        <p className="text-text-secondary mt-1">Detect unsupported claims and fabricated facts in LLM outputs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
          <h3 className="text-lg font-semibold text-text-primary">Detection Input</h3>

          <div className="space-y-2">
            <label className="text-sm text-text-secondary">Source Context</label>
            <textarea className="input-glass min-h-[120px] resize-y" placeholder="The source document or context that the LLM should be grounded in..."
              value={form.context} onChange={e => setForm({...form, context: e.target.value})} required />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-text-secondary">LLM Output to Check</label>
            <textarea className="input-glass min-h-[120px] resize-y" placeholder="The LLM output to check for hallucinations..."
              value={form.output} onChange={e => setForm({...form, output: e.target.value})} required />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-text-secondary">Original Prompt <span className="text-text-muted">(optional)</span></label>
            <input className="input-glass" placeholder="The original prompt..." value={form.prompt} onChange={e => setForm({...form, prompt: e.target.value})} />
          </div>

          <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Detecting...</> : <><Send className="w-4 h-4" /> Detect Hallucinations</>}
          </button>
          {error && <div className="p-4 rounded-xl bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-sm">{error}</div>}
        </form>

        <div className="space-y-6">
          {result ? (
            <>
              {/* Score Header */}
              <div className="glass-card p-6 text-center">
                <div className="text-sm text-text-muted mb-2">Hallucination Score</div>
                <div className={`text-5xl font-bold ${result.hallucination_score > 0.5 ? 'text-accent-rose' : result.hallucination_score > 0.2 ? 'text-accent-amber' : 'text-accent-emerald'}`}>
                  {(result.hallucination_score * 100).toFixed(1)}%
                </div>
                <p className="text-text-secondary text-sm mt-2">
                  {result.supported_claims} of {result.total_claims} claims are supported
                </p>
              </div>

              {/* Pie Chart */}
              <div className="glass-card p-6 flex items-center gap-6">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value" stroke="none">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0f1420', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-full bg-accent-emerald" /> Supported: {result.supported_claims}</div>
                  <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-full bg-accent-rose" /> Unsupported: {result.unsupported_claims}</div>
                </div>
              </div>

              {/* Flags */}
              <div className="glass-card p-5 space-y-2">
                <h4 className="text-sm font-medium text-text-secondary mb-3">Detection Flags</h4>
                {result.flags.map((flag: string, i: number) => (
                  <div key={i} className="text-sm text-text-primary bg-white/5 rounded-lg px-4 py-2.5">{flag}</div>
                ))}
              </div>

              {/* Claims List */}
              <div className="glass-card p-5 space-y-3">
                <h4 className="text-sm font-medium text-text-secondary mb-3">Claim Analysis ({result.total_claims} claims)</h4>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {result.claims.map((claim: any, i: number) => (
                    <div key={i} className={`p-4 rounded-xl border ${claim.is_supported ? 'bg-accent-emerald/5 border-accent-emerald/20' : 'bg-accent-rose/5 border-accent-rose/20'}`}>
                      <div className="flex items-start gap-2">
                        {claim.is_supported ? <CheckCircle className="w-4 h-4 text-accent-emerald mt-0.5 shrink-0" /> : <XCircle className="w-4 h-4 text-accent-rose mt-0.5 shrink-0" />}
                        <div>
                          <p className="text-sm text-text-primary">{claim.claim}</p>
                          <p className="text-xs text-text-muted mt-1">Confidence: {(claim.confidence * 100).toFixed(1)}%</p>
                          {claim.evidence && <p className="text-xs text-text-secondary mt-1 italic">Evidence: {claim.evidence.slice(0, 150)}...</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <Shield className="w-16 h-16 text-text-muted mb-4 opacity-30" />
              <h3 className="text-xl font-semibold text-text-secondary">No Results Yet</h3>
              <p className="text-sm text-text-muted mt-2 max-w-sm">Provide context and LLM output to detect hallucinated claims.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
