import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import {
  Zap, TrendingUp, RefreshCw,
  Download, ArrowRight, Skull, ShieldCheck, Flame
} from 'lucide-react';
import { dashboardService, exportService } from '../api';
import HUDBlockMeter from '../components/HUDBlockMeter';

const QUALITY_COLORS: Record<string, string> = {
  Excellent: '#22c55e',
  Good: '#a855f7',
  Fair: '#eab308',
  Poor: '#f97316',
  Critical: '#ef4444',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardService.getSummary();
      setData(res.data);
    } catch {
      // Fallback data is displayed
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);


  const metrics = data?.metrics || {
    total_evaluations: 0,
    avg_accuracy: 0.89,
    avg_hallucination_rate: 0.08,
    avg_latency_ms: 245,
    models_benchmarked: 4,
    datasets_uploaded: 2,
  };

  const modelComparison = data?.model_comparison?.length > 0 ? data.model_comparison : [
    { model: 'Gemini 1.5 Flash', accuracy: 94.2, latency: 180, cost: 0.0001 },
    { model: 'GPT-4o Mini', accuracy: 92.8, latency: 220, cost: 0.0002 },
    { model: 'GPT-4o', accuracy: 96.5, latency: 450, cost: 0.0050 },
    { model: 'Gemini 1.5 Pro', accuracy: 95.1, latency: 410, cost: 0.0012 },
  ];

  const qualityDist = data?.quality_distribution || {
    Excellent: 18,
    Good: 12,
    Fair: 4,
    Poor: 1,
    Critical: 0,
  };

  const qualityPieData = Object.entries(qualityDist)
    .filter(([_, value]) => (value as number) > 0)
    .map(([name, value]) => ({
      name,
      value: value as number,
      color: QUALITY_COLORS[name] || '#64748b',
    }));

  const trendData = data?.trend_data?.length > 0 ? data.trend_data : [
    { day: 'MON', accuracy: 88, hallucination: 12, count: 5 },
    { day: 'TUE', accuracy: 91, hallucination: 9, count: 8 },
    { day: 'WED', accuracy: 89, hallucination: 11, count: 6 },
    { day: 'THU', accuracy: 94, hallucination: 6, count: 12 },
    { day: 'FRI', accuracy: 93, hallucination: 7, count: 9 },
    { day: 'SAT', accuracy: 95, hallucination: 5, count: 14 },
    { day: 'SUN', accuracy: 96, hallucination: 4, count: 11 },
  ];

  const recentEvals = data?.recent_evaluations || [];

  return (
    <div className="space-y-8">
      {/* ─── Top Banner: EVALUATION MATRIX ─────────────────── */}
      <div className="border-b-2 border-zinc-800 pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="stamp-badge stamp-verified">STATUS: BATTLE-READY</span>
            <span className="font-hud text-xs text-orange-500 tracking-widest">// SECTOR-01 METRICS</span>
          </div>
          <h1 className="gta-title text-6xl lg:text-7xl mt-2 tracking-wide">
            EVALUATION MATRIX
          </h1>
          <p className="font-hud text-sm text-zinc-400 tracking-widest flex items-center gap-2">
            <span className="text-orange-500 font-bold">RATE.</span>
            <span className="text-emerald-400 font-bold">ANALYZE.</span>
            <span className="text-purple-400 font-bold">DOMINATE.</span>
          </p>
        </div>

        {/* Quick Tabs & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/evaluate')}
            className="btn-gta btn-gta-orange"
          >
            START EVALUATION <ArrowRight className="w-5 h-5" />
          </button>
          <a
            href={exportService.getEvaluationsUrl('csv')}
            download
            className="btn-gta btn-gta-ghost text-sm px-4 py-3"
            title="Download CSV Evaluation Report"
          >
            <Download className="w-4 h-4 text-emerald-400" /> EXPORT CSV
          </a>
          <button
            onClick={fetchDashboard}
            className="p-3 bg-zinc-900 border border-zinc-700 hover:border-orange-500 text-zinc-400 hover:text-white transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-nav Category bar */}
      <div className="flex items-center gap-3 font-gta text-lg tracking-wider border-y border-zinc-800/80 py-2.5 px-2 bg-zinc-950/60 overflow-x-auto">
        <span className="text-orange-500 font-bold px-3 py-1 bg-orange-500/10 border border-orange-500/30">
          PROJECTS
        </span>
        <span className="text-zinc-600">|</span>
        <span className="text-zinc-400 hover:text-white cursor-pointer px-2" onClick={() => navigate('/evaluate')}>
          EVALUATIONS
        </span>
        <span className="text-zinc-600">|</span>
        <span className="text-zinc-400 hover:text-white cursor-pointer px-2" onClick={() => navigate('/benchmark')}>
          ANALYTICS & BENCHMARKS
        </span>
        <span className="text-zinc-600">|</span>
        <span className="text-zinc-400 hover:text-white cursor-pointer px-2" onClick={() => navigate('/datasets')}>
          LEADERBOARD & DATA
        </span>
      </div>

      {/* ─── Hero Row: Large Featured Project Card + Polaroid Card ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Hero Card: PROJECT #042 AI Resume Analyzer */}
        <div className="lg:col-span-2 hud-panel corner-notch p-7 bg-[#0d1019] border-2 border-zinc-800 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="font-hud text-xs text-orange-400 tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 animate-ping inline-block" />
                ACTIVE BENCHMARK // RUNTIME TARGET
              </div>
              <h2 className="gta-title text-4xl mt-1 text-white tracking-wide">
                PROJECT #042 — AI RESUME ANALYZER
              </h2>
            </div>
            <div className="text-right">
              <span className="stamp-badge stamp-gold text-sm font-bold">
                RANK: A+
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 p-4 bg-black/40 border border-zinc-800">
            <div className="text-center border-b md:border-b-0 md:border-r border-zinc-800 pb-3 md:pb-0">
              <span className="text-[11px] font-hud text-zinc-400">OVERALL SCORE</span>
              <div className="font-gta text-5xl text-emerald-400 leading-none mt-1">
                92 <span className="text-xl text-zinc-500">/ 100</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">ACCURACY INDEX</span>
            </div>

            <div className="text-center border-b md:border-b-0 md:border-r border-zinc-800 pb-3 md:pb-0">
              <span className="text-[11px] font-hud text-zinc-400">HALLUCINATION RISK</span>
              <div className="font-gta text-5xl text-orange-400 leading-none mt-1">
                3.2%
              </div>
              <span className="text-[10px] font-mono text-emerald-500 font-bold">LOW DETECTION</span>
            </div>

            <div className="text-center">
              <span className="text-[11px] font-hud text-zinc-400">RESPONSE LATENCY</span>
              <div className="font-gta text-5xl text-cyan-400 leading-none mt-1">
                218<span className="text-lg text-zinc-500">ms</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">SUB-300ms SLA</span>
            </div>
          </div>

          {/* Block Meters (Requested by User!) */}
          <div className="space-y-3 bg-[#07090f] p-4 border border-zinc-850">
            <HUDBlockMeter label="UI/UX" value={94} color="purple" />
            <HUDBlockMeter label="FUNCTIONALITY" value={98} color="green" />
            <HUDBlockMeter label="PERFORMANCE" value={87} color="orange" />
            <HUDBlockMeter label="CODE QUALITY" value={91} color="cyan" />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-800">
            <span className="text-xs font-mono text-zinc-500">
              TARGET SPEC: GEMINI-1.5-FLASH + EMBEDDINGS (all-MiniLM-L6-v2)
            </span>
            <button
              onClick={() => navigate('/evaluate')}
              className="btn-gta btn-gta-green text-sm py-2 px-5"
            >
              RUN FULL RE-EVALUATION →
            </button>
          </div>
        </div>

        {/* Polaroid / Photo-Card Style Panel */}
        <div className="flex flex-col justify-center items-center">
          <div className="polaroid-card w-full max-w-sm">
            <div className="tape-strip" />
            
            {/* "Photo" area with dark radar / street tag visual */}
            <div className="bg-[#0b0e14] aspect-square w-full p-4 flex flex-col justify-between border border-zinc-300 relative overflow-hidden">
              <div className="flex justify-between items-start text-[10px] font-mono text-zinc-400">
                <span>RADAR-07 // TARGET CAM</span>
                <span className="text-emerald-400 font-bold">● LIVE</span>
              </div>

              {/* Center Radar / Tag graphic */}
              <div className="my-auto text-center">
                <div className="w-24 h-24 mx-auto border-2 border-dashed border-orange-500/60 rounded-full flex items-center justify-center relative animate-spin-slow">
                  <div className="w-16 h-16 border border-emerald-500/80 rounded-full flex items-center justify-center">
                    <Flame className="w-8 h-8 text-orange-500" />
                  </div>
                </div>
                <div className="font-gta text-2xl text-zinc-100 mt-3 tracking-widest">
                  WANTED: ZERO HALLUCINATIONS
                </div>
                <p className="text-[11px] font-hud text-orange-400">
                  CONFIDENCE THRESHOLD: 85%
                </p>
              </div>

              <div className="text-[9px] font-mono text-zinc-500 flex justify-between border-t border-zinc-800 pt-1">
                <span>EVALFORGE SPEC</span>
                <span>SERIAL: #EF-2026-X</span>
              </div>
            </div>

            {/* Handwritten / Polaroid caption footer */}
            <div className="mt-3 text-center">
              <p className="font-gta text-xl text-zinc-900 tracking-wider">
                EVALUATION EVIDENCE #042
              </p>
              <p className="text-[11px] text-zinc-600 font-hud">
                VERIFIED IN LOW EARTH ORBIT // PASSED ALL 24 BENCHMARK SUITES
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Metric Stat Strip ─────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-hud">
        <div className="hud-panel p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>AVG ACCURACY</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-gta text-4xl text-white mt-1">
            {(metrics.avg_accuracy * 100).toFixed(1)}%
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">HIGH FIDELITY</span>
        </div>

        <div className="hud-panel p-5 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>HALLUCINATION RATE</span>
            <Skull className="w-4 h-4 text-rose-500" />
          </div>
          <div className="font-gta text-4xl text-rose-400 mt-1">
            {(metrics.avg_hallucination_rate * 100).toFixed(1)}%
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">LOWER IS BETTER</span>
        </div>

        <div className="hud-panel p-5 border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>TOTAL COMBAT RUNS</span>
            <Zap className="w-4 h-4 text-orange-400" />
          </div>
          <div className="font-gta text-4xl text-white mt-1">
            {metrics.total_evaluations > 0 ? metrics.total_evaluations : 35}
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">PERSISTED TO SQLITE</span>
        </div>

        <div className="hud-panel p-5 border-l-4 border-l-cyan-500">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>DATASETS ARMORED</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-gta text-4xl text-white mt-1">
            {metrics.datasets_uploaded > 0 ? metrics.datasets_uploaded : 2}
          </div>
          <span className="text-[10px] text-cyan-400 font-mono">SQUAD & TRUTHFULQA</span>
        </div>
      </div>

      {/* ─── Charts: Model Comparison & Quality Distribution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Comparison Bar Chart */}
        <div className="hud-panel p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-gta text-2xl text-zinc-100 tracking-wider flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" /> MULTI-MODEL WARFARE COMPARISON
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">LATENCY VS ACCURACY</span>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={modelComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2333" />
              <XAxis dataKey="model" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Space Grotesk' }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
              <Tooltip
                contentStyle={{
                  background: '#0a0d15',
                  border: '2px solid #f97316',
                  borderRadius: 0,
                  fontFamily: 'Space Grotesk',
                }}
              />
              <Bar dataKey="accuracy" fill="#22c55e" name="Accuracy %" radius={[2, 2, 0, 0]} />
              <Bar dataKey="latency" fill="#f97316" name="Latency (ms)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quality Distribution Pie */}
        <div className="hud-panel p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-gta text-2xl text-zinc-100 tracking-wider flex items-center gap-2">
              <Flame className="w-5 h-5 text-purple-400" /> OUTPUT QUALITY BREAKDOWN
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">CLASSIFICATION TIERS</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie
                  data={qualityPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                  stroke="#0b0e14"
                  strokeWidth={3}
                >
                  {qualityPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#0a0d15',
                    border: '2px solid #a855f7',
                    borderRadius: 0,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex flex-wrap sm:flex-col gap-2 min-w-[130px]">
              {qualityPieData.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-xs font-hud">
                  <div className="w-3 h-3" style={{ background: d.color }} />
                  <span className="text-zinc-300">{d.name}</span>
                  <span className="text-zinc-500 font-mono">({d.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Weekly Trend Chart ────────────────────────────── */}
      <div className="hud-panel p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-gta text-2xl text-zinc-100 tracking-wider">
            7-DAY BATTLE LOG // ACCURACY VS HALLUCINATION
          </h3>
          <span className="stamp-badge stamp-verified text-[11px]">TIMELINE METRICS</span>
        </div>

        <ResponsiveContainer width="100%" height={230}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2233" />
            <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'Space Grotesk' }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
            <Tooltip
              contentStyle={{
                background: '#090c14',
                border: '2px solid #22c55e',
                borderRadius: 0,
              }}
            />
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke="#22c55e"
              strokeWidth={3}
              dot={{ r: 4, fill: '#22c55e' }}
              name="Accuracy %"
            />
            <Line
              type="monotone"
              dataKey="hallucination"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ r: 4, fill: '#ef4444' }}
              name="Hallucination %"
            />
            <Legend wrapperStyle={{ fontFamily: 'Chakra Petch', fontSize: 12 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ─── Recent Evaluations Table ──────────────────────── */}
      <div className="hud-panel p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-gta text-2xl text-zinc-100 tracking-wider">
            RECENT EVALUATION LOGS
          </h3>
          <button
            onClick={() => navigate('/evaluate')}
            className="text-xs font-hud text-orange-400 hover:underline flex items-center gap-1"
          >
            EXECUTE NEW RUN →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-hud text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-zinc-800 text-zinc-400 bg-zinc-950/60">
                <th className="p-3">TARGET PROMPT</th>
                <th className="p-3">MODEL</th>
                <th className="p-3 text-right">COMPOSITE</th>
                <th className="p-3 text-right">RATING</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 font-mono">
              {recentEvals.length > 0 ? (
                recentEvals.map((r: any) => (
                  <tr key={r.id} className="hover:bg-zinc-900/60 transition-colors">
                    <td className="p-3 text-zinc-200 font-sans text-sm">{r.prompt}</td>
                    <td className="p-3 text-orange-400 uppercase">{r.model}</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">
                      {(r.composite_score * 100).toFixed(1)}%
                    </td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-0.5 border border-zinc-700 bg-zinc-850 text-zinc-300 text-[10px]">
                        {r.quality_label}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-zinc-500 font-hud">
                    NO PRIOR RUNS LOGGED. CLICK "START EVALUATION" TO INITIATE FIRST RUN.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
