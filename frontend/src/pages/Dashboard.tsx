import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Activity, Zap, ShieldAlert, Clock, TrendingUp, Database } from 'lucide-react';
import ScoreCard from '../components/ScoreCard';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];

// Demo data for the dashboard
const demoMetrics = {
  totalEvaluations: 1247,
  avgAccuracy: 0.856,
  avgHallucinationRate: 0.18,
  avgLatency: 245,
};

const modelComparisonData = [
  { model: 'Gemini Flash', accuracy: 87, latency: 180, cost: 0.15, hallucination: 12 },
  { model: 'Gemini Pro', accuracy: 92, latency: 350, cost: 1.25, hallucination: 8 },
  { model: 'GPT-4o Mini', accuracy: 85, latency: 220, cost: 0.30, hallucination: 15 },
  { model: 'GPT-4o', accuracy: 94, latency: 480, cost: 5.00, hallucination: 6 },
  { model: 'GPT-3.5', accuracy: 78, latency: 150, cost: 0.50, hallucination: 22 },
];

const qualityDistData = [
  { name: 'Excellent', value: 340, color: '#10b981' },
  { name: 'Good', value: 520, color: '#6366f1' },
  { name: 'Fair', value: 245, color: '#f59e0b' },
  { name: 'Poor', value: 102, color: '#f97316' },
  { name: 'Critical', value: 40, color: '#f43f5e' },
];

const trendData = [
  { day: 'Mon', accuracy: 82, hallucination: 22 },
  { day: 'Tue', accuracy: 84, hallucination: 19 },
  { day: 'Wed', accuracy: 86, hallucination: 17 },
  { day: 'Thu', accuracy: 85, hallucination: 18 },
  { day: 'Fri', accuracy: 88, hallucination: 14 },
  { day: 'Sat', accuracy: 87, hallucination: 15 },
  { day: 'Sun', accuracy: 90, hallucination: 12 },
];

const radarData = [
  { metric: 'Semantic Sim', gemini: 88, openai: 92 },
  { metric: 'Relevance', gemini: 85, openai: 87 },
  { metric: 'Groundedness', gemini: 90, openai: 85 },
  { metric: 'Faithfulness', gemini: 82, openai: 89 },
  { metric: 'Latency', gemini: 92, openai: 75 },
  { metric: 'Cost Eff.', gemini: 95, openai: 60 },
];

export default function Dashboard() {
  const [animate, setAnimate] = useState(false);
  useEffect(() => { setAnimate(true); }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={`transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
        <p className="text-text-secondary mt-1">Real-time LLM evaluation metrics and performance insights</p>
      </div>

      {/* Top Metric Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 transition-all duration-700 delay-100 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <ScoreCard title="Avg Accuracy" value={demoMetrics.avgAccuracy} icon={<TrendingUp className="w-4 h-4" />} color="#10b981" subtitle="Across all evaluations" />
        <ScoreCard title="Hallucination Rate" value={demoMetrics.avgHallucinationRate} icon={<ShieldAlert className="w-4 h-4" />} color="#f43f5e" subtitle="Lower is better" />
        <div className="glass-card p-6 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-accent-primary/10 flex items-center justify-center">
            <Activity className="w-7 h-7 text-accent-primary" />
          </div>
          <span className="text-3xl font-bold text-text-primary">{demoMetrics.totalEvaluations.toLocaleString()}</span>
          <span className="text-sm text-text-muted">Total Evaluations</span>
        </div>
        <div className="glass-card p-6 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-accent-cyan/10 flex items-center justify-center">
            <Clock className="w-7 h-7 text-accent-cyan" />
          </div>
          <span className="text-3xl font-bold text-text-primary">{demoMetrics.avgLatency}<span className="text-lg text-text-muted">ms</span></span>
          <span className="text-sm text-text-muted">Avg Response Latency</span>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-700 delay-200 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Model Comparison Bar Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent-primary" /> Model Comparison
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={modelComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="model" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0f1420', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
              <Bar dataKey="accuracy" fill="#6366f1" radius={[6, 6, 0, 0]} name="Accuracy %" />
              <Bar dataKey="hallucination" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Hallucination %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-accent-secondary" /> Multi-Metric Radar
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={[0, 100]} />
              <Radar name="Gemini" dataKey="gemini" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
              <Radar name="OpenAI" dataKey="openai" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-all duration-700 delay-300 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Quality Distribution Pie */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Quality Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={qualityDistData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                {qualityDistData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f1420', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {qualityDistData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-text-secondary">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>

        {/* Trend Line Chart */}
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Weekly Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#0f1420', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
              <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} name="Accuracy %" />
              <Line type="monotone" dataKey="hallucination" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 4, fill: '#f43f5e' }} name="Hallucination %" />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
