import { useState } from 'react';
import {
  Crosshair, Loader2, AlertOctagon, CheckCircle
} from 'lucide-react';

import { hallucinationService } from '../api';
import { useToast } from '../components/Toast';
import AnnotatedOutput from '../components/AnnotatedOutput';
import HUDBlockMeter from '../components/HUDBlockMeter';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const FACTUAL_SAMPLE = {
  context: 'The James Webb Space Telescope (JWST) was launched on December 25, 2021 from Kourou, French Guiana. It is an infrared observatory developed by NASA with contributions from the European Space Agency (ESA) and the Canadian Space Agency (CSA). JWST operates in a halo orbit around the Sun-Earth L2 Lagrange point.',
  output: 'The James Webb Space Telescope launched on December 25, 2021 from French Guiana. Developed by NASA alongside ESA and CSA, it observes the universe in infrared from a halo orbit around the L2 Lagrange point.',
  prompt: 'Summarize the launch and operations of JWST.',
};

const FABRICATED_SAMPLE = {
  context: 'The Apollo 11 mission was launched on July 16, 1969 from Kennedy Space Center. Neil Armstrong and Buzz Aldrin were the first humans to land on the Moon on July 20, 1969.',
  output: 'The Apollo 11 mission was launched in August 1972 from Tokyo. Astronauts Neil Armstrong and Elon Musk landed on Mars using nuclear fusion propulsion and discovered liquid water reservoirs.',
  prompt: 'Describe the Apollo 11 expedition.',
};

export default function Hallucination() {
  const [form, setForm] = useState({ context: '', output: '', prompt: '' });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  const loadFactual = () => {
    setForm(FACTUAL_SAMPLE);
    addToast({ type: 'info', title: 'FACTUAL SAMPLE LOADED', message: 'Loaded verified JWST document.' });
  };

  const loadFabricated = () => {
    setForm(FABRICATED_SAMPLE);
    addToast({ type: 'warning', title: 'FABRICATED SAMPLE LOADED', message: 'Loaded heavily hallucinated test output.' });
  };

  const validate = (): string | null => {
    if (form.context.trim().length < 20) return 'Source context must contain at least 20 characters.';
    if (form.output.trim().length < 20) return 'LLM output to check must contain at least 20 characters.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      addToast({ type: 'warning', title: 'INPUT ERROR', message: validationError });
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await hallucinationService.detect(form);
      setResult(res.data);
      const score = res.data.hallucination_score;
      addToast({
        type: score > 0.4 ? 'error' : 'success',
        title: score > 0.4 ? 'CRITICAL DRIFT DETECTED' : 'EVIDENCE VERIFIED',
        message: `Hallucination rate: ${(score * 100).toFixed(1)}% (${res.data.supported_claims}/${res.data.total_claims} claims supported)`,
      });
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Detection failed. Ensure the backend server is running.';
      setError(msg);
      addToast({ type: 'error', title: 'RADAR FAILED', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const pieData = result ? [
    { name: 'Supported', value: result.supported_claims, color: '#22c55e' },
    { name: 'Unsupported', value: result.unsupported_claims, color: '#ef4444' },
  ] : [];

  return (
    <div className="space-y-8">
      {/* ─── Header ────────────────────────────────────────── */}
      <div className="border-b-2 border-zinc-800 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="stamp-badge stamp-wanted text-xs">RADAR-03 SCANNER</span>
            <span className="font-hud text-xs text-orange-400">// EVIDENCE AUDITING</span>
          </div>
          <h1 className="gta-title text-5xl lg:text-6xl mt-1 tracking-wide">
            HALLUCINATION RADAR
          </h1>
          <p className="font-hud text-xs text-zinc-400 tracking-widest mt-1">
            EXTRACT INDIVIDUAL CLAIMS • CROSS-EXAMINE CONTEXT • NEUTRALIZE FABRICATED FACTS
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={loadFactual}
            className="btn-gta btn-gta-ghost text-xs px-3 py-2 text-emerald-400 border-emerald-500/40"
          >
            <CheckCircle className="w-3.5 h-3.5" /> LOAD FACTUAL
          </button>
          <button
            type="button"
            onClick={loadFabricated}
            className="btn-gta btn-gta-ghost text-xs px-3 py-2 text-rose-400 border-rose-500/40"
          >
            <AlertOctagon className="w-3.5 h-3.5" /> LOAD FABRICATED
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ─── Input Form ──────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="hud-panel corner-notch p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <h3 className="font-gta text-2xl text-zinc-100 tracking-wider flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-orange-500" /> EVIDENCE RADAR TARGET
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">AUDIT STREAM</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-hud text-xs text-zinc-300">SOURCE CONTEXT / EVIDENCE DOCUMENT</label>
              <span className="font-mono text-[10px] text-zinc-500">{form.context.length} CHARS</span>
            </div>
            <textarea
              className="gta-input min-h-[120px] resize-y"
              placeholder="Paste the source document that the LLM response must be strictly grounded in..."
              value={form.context}
              onChange={(e) => setForm({ ...form, context: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-hud text-xs text-zinc-300">LLM OUTPUT TO INTERROGATE</label>
              <span className="font-mono text-[10px] text-zinc-500">{form.output.length} CHARS</span>
            </div>
            <textarea
              className="gta-input min-h-[120px] resize-y"
              placeholder="Paste the generated response to audit for factual fabrication..."
              value={form.output}
              onChange={(e) => setForm({ ...form, output: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-hud text-xs text-zinc-300">ORIGINAL PROMPT (OPTIONAL)</label>
            <input
              className="gta-input"
              placeholder="The user prompt that triggered the generation..."
              value={form.prompt}
              onChange={(e) => setForm({ ...form, prompt: e.target.value })}
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
                EXTRACTING & VERIFYING CLAIMS...
              </>
            ) : (
              'RUN RADAR SCAN →'
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-950/40 border-2 border-red-500/40 text-red-400 text-xs font-mono">
              ⚠️ {error}
            </div>
          )}
        </form>

        {/* ─── Detection Results ───────────────────────────── */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Stamped Score Header */}
              <div className="hud-panel p-6 border-2 border-zinc-700 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-hud text-zinc-400">HALLUCINATION SCORE</span>
                    <div className={`font-gta text-6xl leading-none mt-1 ${
                      result.hallucination_score > 0.4 ? 'text-rose-500' : 'text-emerald-400'
                    }`}>
                      {(result.hallucination_score * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`stamp-badge ${
                      result.hallucination_score > 0.4 ? 'stamp-wanted' : 'stamp-verified'
                    }`}>
                      {result.hallucination_score > 0.4 ? 'WANTED: FABRICATED' : 'STAMP: VERIFIED'}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-3 p-4 bg-black/60 border border-zinc-800">
                  <HUDBlockMeter
                    label="SUPPORTED CLAIMS"
                    value={result.total_claims > 0 ? (result.supported_claims / result.total_claims) * 100 : 0}
                    color="green"
                  />
                  <HUDBlockMeter
                    label="FABRICATED CLAIMS"
                    value={result.total_claims > 0 ? (result.unsupported_claims / result.total_claims) * 100 : 0}
                    color="rose"
                  />
                </div>
              </div>

              {/* Pie Chart */}
              <div className="hud-panel p-6 flex items-center justify-between gap-6">
                <ResponsiveContainer width={130} height={130}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" stroke="#0e111a" strokeWidth={2}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0a0d15', border: '1px solid #f97316', borderRadius: 0 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 font-hud text-xs flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500" />
                    <span className="text-zinc-300">SUPPORTED: {result.supported_claims}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-rose-500" />
                    <span className="text-zinc-300">UNSUPPORTED / FABRICATED: {result.unsupported_claims}</span>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 pt-2 border-t border-zinc-800">
                    TOTAL CLAIMS EXTRACTED: {result.total_claims}
                  </div>
                </div>
              </div>

              {/* Intelligence Flags */}
              <div className="hud-panel p-5 space-y-2">
                <h4 className="font-hud text-xs text-zinc-400 uppercase tracking-widest mb-3">
                  RADAR THREAT FLAGS
                </h4>
                {result.flags.map((flag: string, i: number) => (
                  <div key={i} className="text-xs font-mono text-zinc-200 bg-black/50 border border-zinc-800 p-2.5">
                    {flag}
                  </div>
                ))}
              </div>

              {/* Inline Claim Highlighting */}
              <AnnotatedOutput outputText={form.output} claims={result.claims} />
            </>
          ) : (
            <div className="hud-panel p-12 flex flex-col items-center justify-center text-center h-full min-h-[420px] border-dashed border-zinc-800">
              <Crosshair className="w-16 h-16 text-zinc-700 mb-4 opacity-40 animate-pulse" />
              <h3 className="font-gta text-3xl text-zinc-300 tracking-wide">
                RADAR IN ACTIVE STANDBY
              </h3>
              <p className="text-xs font-hud text-zinc-500 mt-2 max-w-sm">
                Provide source context and LLM output, or click "LOAD FACTUAL" / "LOAD FABRICATED" to run a scan.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
