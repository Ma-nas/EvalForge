interface ScoreCardProps {
  title: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

export default function ScoreCard({ title, value, suffix = '', icon, color, subtitle }: ScoreCardProps) {
  const percentage = Math.min(value * 100, 100);
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="glass-card p-6 flex flex-col items-center gap-4">
      {/* Circular Gauge */}
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          {/* Score arc */}
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold" style={{ color }}>{(value * 100).toFixed(1)}</span>
          <span className="text-[10px] text-text-muted">{suffix || '%'}</span>
        </div>
      </div>

      {/* Label */}
      <div className="text-center">
        <div className="flex items-center gap-2 justify-center text-sm font-medium text-text-primary">
          {icon}
          {title}
        </div>
        {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
