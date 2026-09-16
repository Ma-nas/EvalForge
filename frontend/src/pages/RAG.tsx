import { useState } from 'react';
import {
  Layers, Loader2, Plus, Minus, Sparkles
} from 'lucide-react';

import { ragService } from '../api';
import { useToast } from '../components/Toast';
import HUDBlockMeter from '../components/HUDBlockMeter';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Tooltip
} from 'recharts';

const SAMPLE_RAG = {
  query: 'What are the environmental impacts of lithium-ion battery extraction and how can recycling mitigate them?',
  retrieved_contexts: [
    'Lithium extraction requires significant water usage—approximately 500,000 gallons per metric ton of lithium—often depleting local groundwater in arid salt-flat regions like Chile and Argentina.',
    'Closed-loop hydrometallurgical recycling can recover up to 95% of battery-grade cobalt, nickel, and lithium, drastically cutting raw material mining demands and reducing lifecycle emissions by 40%.',
    'Open-pit cobalt mining generates heavy metal runoff and sulfuric acid drainage that contaminates surrounding river basins and topsoil if not properly neutralized.',
  ],
  generated_output: 'Lithium-ion extraction consumes approximately 500,000 gallons of water per ton and threatens local arid water tables. Closed-loop hydrometallurgical recycling mitigates this by recovering up to 95% of key battery minerals like cobalt and lithium, cutting raw mining demands and lowering lifecycle emissions by 40%.',
  ground_truth: 'Lithium mining heavily depletes groundwater resources in regions like South America. Hydrometallurgical recycling processes can recover up to 95% of lithium and cobalt, reducing environmental degradation.',
};

export default function RAG() {
  const [form, setForm] = useState({ query: '', generated_output: '', ground_truth: '' });
  const [contexts, setContexts] = useState<string[]>(['']);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  const loadSample = () => {
    setForm({
      query: SAMPLE_RAG.query,
      generated_output: SAMPLE_RAG.generated_output,
      ground_truth: SAMPLE_RAG.ground_truth,
    });
    setContexts(SAMPLE_RAG.retrieved_contexts);
    addToast({
      type: 'info',
      title: 'RAG SCENARIO ARMED',
      message: 'Clean tech lithium battery RAG chunks loaded.',
    });
  };

  const addContext = () => setContexts([...contexts, '']);
  const removeContext = (i: number) => setContexts(contexts.filter((_, idx) => idx !== i));
  const updateContext = (i: number, val: string) => {
    const copy = [...contexts];
    copy[i] = val;
    setContexts(copy);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validContexts = contexts.filter((c) => c.trim());
    if (validContexts.length === 0) {
      addToast({ type: 'warning', title: 'PARAM ERROR', message: 'Add at least one non-empty retrieved chunk.' });
      return;
    }
    if (form.query.trim().length < 5) {
      addToast({ type: 'warning', title: 'PARAM ERROR', message: 'Query must be at least 5 characters.' });
      return;
    }
    if (form.generated_output.trim().length < 5) {
      addToast({ type: 'warning', title: 'PARAM ERROR', message: 'Generated output must be at least 5 characters.' });
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await ragService.evaluate({
        ...form,
        retrieved_contexts: validContexts,
        ground_truth: form.ground_truth || undefined,
      });
      setResult(res.data);
      addToast({
        type: res.data.composite_rag_score > 0.7 ? 'success' : 'warning',
        title: 'RAG PIPELINE AUDITED',
        message: `Composite Score: ${(res.data.composite_rag_score * 100).toFixed(1)}%`,
      });
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'RAG evaluation failed.';
      setError(msg);
      addToast({ type: 'error', title: 'AUDIT FAILED', message: msg });
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
      {/* ─── Header ────────────────────────────────────────── */}
      <div className="border-b-2 border-zinc-800 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="stamp-badge stamp-verified text-xs">SECTOR-05 RETRIEVAL</span>
            <span className="font-hud text-xs text-orange-400">// RAG INTEGRATION PIPELINE</span>
          </div>
          <h1 className="gta-title text-5xl lg:text-6xl mt-1 tracking-wide">
            RAG PIPELINE EVALUATION
          </h1>
          <p className="font-hud text-xs text-zinc-400 tracking-widest mt-1">
            RETRIEVAL PRECISION • FAITHFULNESS AUDITING • CONTEXT GROUNDEDNESS RADAR
          </p>
        </div>

        <button
          type="button"
          onClick={loadSample}
          className="btn-gta btn-gta-ghost text-xs px-4 py-2.5"
        >
          <Sparkles className="w-4 h-4 text-orange-400" /> LOAD RAG SCENARIO
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ─── Input Form ──────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="hud-panel corner-notch p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <h3 className="font-gta text-2xl text-zinc-100 tracking-wider flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-500" /> PIPELINE ARCHITECTURE INPUTS
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">TRIAD SPEC</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-hud text-xs text-zinc-300">USER SEARCH QUERY</label>
              <span className="font-mono text-[10px] text-zinc-500">{form.query.length} CHARS</span>
            </div>
            <textarea
              className="gta-input min-h-[70px] resize-y"
              placeholder="The user's query dispatched to the retriever..."
              value={form.query}
              onChange={(e) => setForm({ ...form, query: e.target.value })}
              required
            />
          </div>

          {/* Retrieved Context Chunks */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-hud text-xs text-zinc-300">
                RETRIEVED CONTEXT PASSAGES ({contexts.filter((c) => c.trim()).length}/{contexts.length})
              </label>
              <button
                type="button"
                onClick={addContext}
                className="btn-gta btn-gta-ghost text-[10px] py-1 px-3"
              >
                <Plus className="w-3 h-3 text-orange-400" /> ADD PASSAGE
              </button>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {contexts.map((ctx, i) => (
                <div key={i} className="flex gap-2">
                  <textarea
                    className="gta-input min-h-[55px] resize-y flex-1 text-xs"
                    placeholder={`Retrieved passage #${i + 1}...`}
                    value={ctx}
                    onChange={(e) => updateContext(i, e.target.value)}
                  />
                  {contexts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContext(i)}
                      className="p-2 text-zinc-500 hover:text-rose-500 border border-zinc-800 hover:border-rose-500/50 bg-black self-start"
                      title="Remove passage"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-hud text-xs text-zinc-300">RAG GENERATED OUTPUT</label>
              <span className="font-mono text-[10px] text-zinc-500">{form.generated_output.length} CHARS</span>
            </div>
            <textarea
              className="gta-input min-h-[80px] resize-y"
              placeholder="The RAG system's synthesised answer..."
              value={form.generated_output}
              onChange={(e) => setForm({ ...form, generated_output: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-hud text-xs text-zinc-300">GROUND TRUTH TARGET (OPTIONAL)</label>
            <textarea
              className="gta-input min-h-[60px] resize-y"
              placeholder="Verified ideal ground-truth answer..."
              value={form.ground_truth}
              onChange={(e) => setForm({ ...form, ground_truth: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gta btn-gta-orange w-full justify-center mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                AUDITING PIPELINE QUALITY...
              </>
            ) : (
              'DISPATCH RAG EVALUATION →'
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
              {/* Score Header */}
              <div className="hud-panel p-6 border-2 border-zinc-700 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-hud text-zinc-400">COMPOSITE RAG SCORE</span>
                    <div className={`font-gta text-6xl leading-none mt-1 ${
                      result.composite_rag_score > 0.7 ? 'text-emerald-400' : 'text-orange-400'
                    }`}>
                      {(result.composite_rag_score * 100).toFixed(1)}{' '}
                      <span className="text-2xl text-zinc-500">/ 100</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`stamp-badge ${
                      result.composite_rag_score > 0.7 ? 'stamp-verified' : 'stamp-gold'
                    }`}>
                      {result.composite_rag_score > 0.7 ? 'TIER 1 // VERIFIED' : 'TIER 2 // FAIR'}
                    </span>
                  </div>
                </div>

                {/* Block Meters */}
                <div className="mt-6 space-y-3 p-4 bg-black/60 border border-zinc-800">
                  <HUDBlockMeter label="RETRIEVAL PRECISION" value={result.retrieval_precision * 100} color="purple" />
                  <HUDBlockMeter label="CONTEXT RELEVANCE" value={result.context_relevance * 100} color="orange" />
                  <HUDBlockMeter label="ANSWER RELEVANCE" value={result.answer_relevance * 100} color="cyan" />
                  <HUDBlockMeter label="GROUNDEDNESS" value={result.groundedness_score * 100} color="green" />
                  <HUDBlockMeter label="FAITHFULNESS" value={result.faithfulness_score * 100} color="green" />
                </div>
              </div>

              {/* RAG Radar Chart */}
              <div className="hud-panel p-6">
                <h4 className="font-gta text-2xl text-zinc-100 tracking-wider mb-4">
                  RAG FIDELITY RADAR
                </h4>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#232a3c" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Space Grotesk' }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} />
                    <Radar dataKey="value" stroke="#f97316" fill="#f97316" fillOpacity={0.3} strokeWidth={2} />
                    <Tooltip contentStyle={{ background: '#0a0d15', border: '2px solid #f97316', borderRadius: 0 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Analysis Flags */}
              <div className="hud-panel p-5 space-y-2">
                <h4 className="font-hud text-xs text-zinc-400 uppercase tracking-widest mb-3">
                  RAG PIPELINE AUDIT ADVISORIES
                </h4>
                {result.flags.map((flag: string, i: number) => (
                  <div key={i} className="text-xs font-mono text-zinc-200 bg-black/50 border border-zinc-800 p-2.5">
                    {flag}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="hud-panel p-12 flex flex-col items-center justify-center text-center h-full min-h-[420px] border-dashed border-zinc-800">
              <Layers className="w-16 h-16 text-zinc-700 mb-4 opacity-40 animate-pulse" />
              <h3 className="font-gta text-3xl text-zinc-300 tracking-wide">
                AWAITING PIPELINE TRANSMISSION
              </h3>
              <p className="text-xs font-hud text-zinc-500 mt-2 max-w-sm">
                Provide query, context chunks, and generated output or click "LOAD RAG SCENARIO" to audit retrieval and synthesis quality.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
