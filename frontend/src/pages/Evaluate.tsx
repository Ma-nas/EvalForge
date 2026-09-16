import { useState } from 'react';
import {
  Target, Loader2, Sparkles, Download
} from 'lucide-react';

import { evaluateService, exportService } from '../api';
import { useToast } from '../components/Toast';
import HUDBlockMeter from '../components/HUDBlockMeter';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const SAMPLE_EVALUATION = {
  prompt: 'Explain how Large Language Models generate human-like text and handle context.',
  context: 'LLMs are transformer-based neural networks trained on large corpora of text. They predict subsequent tokens using multi-head self-attention mechanisms, computing probability distributions across vocabulary tokens.',
  expected_output: 'Large Language Models utilize the transformer architecture with self-attention to predict the most probable next token given previous context, enabling coherent text generation.',
  actual_output: 'LLMs generate text using transformer neural networks and self-attention mechanisms to calculate the probability of next words sequentially based on the preceding context.',
  model_name: 'gemini-1.5-flash',
};

export default function Evaluate() {
  const [form, setForm] = useState({
    prompt: '',
    context: '',
    expected_output: '',
    actual_output: '',
    model_name: 'gemini-1.5-flash',
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  const loadSample = () => {
    setForm(SAMPLE_EVALUATION);
    addToast({
      type: 'info',
      title: 'SAMPLE ARSENAL LOADED',
      message: 'Transformer architecture test case populated.',
    });
  };

  const validate = (): string | null => {
    if (form.prompt.trim().length < 5) return 'Prompt must contain at least 5 characters.';
    if (form.expected_output.trim().length < 5) return 'Expected output must contain at least 5 characters.';
    if (form.actual_output.trim().length < 5) return 'Actual output must contain at least 5 characters.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      addToast({ type: 'warning', title: 'MISSION PARAMETER ERROR', message: validationError });
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await evaluateService.single(form);
      setResult(res.data);
      addToast({
        type: 'success',
        title: 'EVALUATION COMPLETE',
        message: `Rank: ${res.data.quality_label} — Score: ${(res.data.composite_score * 100).toFixed(1)}%`,
      });
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Evaluation failed. Verify the backend service is operational.';
      setError(msg);
      addToast({ type: 'error', title: 'MISSION FAILED', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const chartData = result
    ? [
        { metric: 'Semantic Sim', score: +(result.semantic_similarity * 100).toFixed(1), fill: '#a855f7' },
        { metric: 'Relevance', score: +(result.relevance_score * 100).toFixed(1), fill: '#f97316' },
        { metric: 'Groundedness', score: +(result.groundedness_score * 100).toFixed(1), fill: '#06b6d4' },
        { metric: 'Composite', score: +(result.composite_score * 100).toFixed(1), fill: '#22c55e' },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* ─── Header ────────────────────────────────────────── */}
      <div className="border-b-2 border-zinc-800 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="stamp-badge stamp-verified text-xs">SECTOR-02 TARGETING</span>
            <span className="font-hud text-xs text-orange-400">// BENCHMARK PROTOCOL</span>
          </div>
          <h1 className="gta-title text-5xl lg:text-6xl mt-1 tracking-wide">
            ACCURACY & QUALITY EVALUATION
          </h1>
          <p className="font-hud text-xs text-zinc-400 tracking-widest mt-1">
            SCORE MODEL ACCURACY • MEASURE SEMANTIC DIVERGENCE • ENFORCE GROUNDING
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadSample}
            className="btn-gta btn-gta-ghost text-xs px-4 py-2.5"
          >
            <Sparkles className="w-4 h-4 text-orange-400" /> LOAD SAMPLE CASE
          </button>
          {result && (
            <a
              href={exportService.getEvaluationsUrl('csv')}
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
              <Target className="w-5 h-5 text-orange-500" /> TARGET MISSION PARAMETERS
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">INPUT MATRIX</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-hud text-xs text-zinc-300">INPUT PROMPT / QUERY</label>
              <span className="font-mono text-[10px] text-zinc-500">{form.prompt.length} CHARS</span>
            </div>
            <textarea
              className="gta-input min-h-[80px] resize-y"
              placeholder="Enter the exact prompt dispatched to the LLM..."
              value={form.prompt}
              onChange={(e) => setForm({ ...form, prompt: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-hud text-xs text-zinc-300">
              SOURCE CONTEXT / REFERENCE <span className="text-zinc-500">(OPTIONAL)</span>
            </label>
            <textarea
              className="gta-input min-h-[70px] resize-y"
              placeholder="Reference document or context window provided to the model..."
              value={form.context}
              onChange={(e) => setForm({ ...form, context: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-hud text-xs text-zinc-300">GROUND TRUTH / EXPECTED OUTPUT</label>
              <span className="font-mono text-[10px] text-zinc-500">{form.expected_output.length} CHARS</span>
            </div>
            <textarea
              className="gta-input min-h-[80px] resize-y"
              placeholder="The verified, expected ground-truth output..."
              value={form.expected_output}
              onChange={(e) => setForm({ ...form, expected_output: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-hud text-xs text-zinc-300">ACTUAL LLM OUTPUT</label>
              <span className="font-mono text-[10px] text-zinc-500">{form.actual_output.length} CHARS</span>
            </div>
            <textarea
              className="gta-input min-h-[80px] resize-y"
              placeholder="The generated response from the target LLM..."
              value={form.actual_output}
              onChange={(e) => setForm({ ...form, actual_output: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-hud text-xs text-zinc-300">TARGET MODEL IDENTIFIER</label>
            <input
              className="gta-input"
              placeholder="e.g., gemini-1.5-flash, gpt-4o"
              value={form.model_name}
              onChange={(e) => setForm({ ...form, model_name: e.target.value })}
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
                ANALYZING EMBEDDINGS...
              </>
            ) : (
              'START EVALUATION →'
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
              {/* Stamped Overall Score Card */}
              <div className="hud-panel p-6 border-2 border-zinc-700 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-hud text-zinc-400">COMPOSITE RATING</span>
                    <div className="font-gta text-6xl text-emerald-400 leading-none mt-1">
                      {(result.composite_score * 100).toFixed(1)}{' '}
                      <span className="text-2xl text-zinc-500">/ 100</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`stamp-badge ${
                      result.quality_label === 'Excellent' ? 'stamp-verified' :
                      result.quality_label === 'Good' ? 'stamp-gold' : 'stamp-wanted'
                    }`}>
                      RANK: {result.quality_label}
                    </span>
                  </div>
                </div>

                {/* Block Meters for Scores */}
                <div className="mt-6 space-y-3 p-4 bg-black/60 border border-zinc-800">
                  <HUDBlockMeter
                    label="SEMANTIC SIMILARITY"
                    value={result.semantic_similarity * 100}
                    color="purple"
                  />
                  <HUDBlockMeter
                    label="PROMPT RELEVANCE"
                    value={result.relevance_score * 100}
                    color="orange"
                  />
                  <HUDBlockMeter
                    label="GROUNDEDNESS"
                    value={result.groundedness_score * 100}
                    color="cyan"
                  />
                  <HUDBlockMeter
                    label="HALLUCINATION INVERSE"
                    value={(1.0 - result.hallucination_score) * 100}
                    color="green"
                  />
                </div>
              </div>

              {/* Score Breakdown Bar Chart with Fixed Recharts Cell */}
              <div className="hud-panel p-6">
                <h4 className="font-gta text-xl text-zinc-100 tracking-wider mb-4">
                  METRIC MATRIX VISUALIZER
                </h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2537" />
                    <XAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Space Grotesk' }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        background: '#090b12',
                        border: '2px solid #f97316',
                        borderRadius: 0,
                      }}
                    />
                    <Bar dataKey="score" radius={[2, 2, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Analysis Flags */}
              <div className="hud-panel p-5 space-y-2">
                <h4 className="font-hud text-xs text-zinc-400 uppercase tracking-widest mb-3">
                  INTELLIGENCE FLAGS & NOTICES
                </h4>
                {result.flags.map((flag: string, i: number) => (
                  <div
                    key={i}
                    className="text-xs font-mono text-zinc-200 bg-black/50 border border-zinc-800 p-3 flex items-center gap-2"
                  >
                    <span>{flag}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="hud-panel p-12 flex flex-col items-center justify-center text-center h-full min-h-[420px] border-dashed border-zinc-800">
              <Target className="w-16 h-16 text-zinc-700 mb-4 opacity-40 animate-pulse" />
              <h3 className="font-gta text-3xl text-zinc-300 tracking-wide">
                AWAITING TARGET COORDINATES
              </h3>
              <p className="text-xs font-hud text-zinc-500 mt-2 max-w-sm">
                Populate prompt and output parameters or click "LOAD SAMPLE CASE" to fire the evaluation engine.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
