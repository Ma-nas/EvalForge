interface HUDBlockMeterProps {
  label: string;
  value: number; // 0 to 100
  color?: 'green' | 'orange' | 'purple' | 'cyan' | 'rose';
  totalBlocks?: number;
}

export default function HUDBlockMeter({
  label,
  value,
  color = 'orange',
  totalBlocks = 10,
}: HUDBlockMeterProps) {
  const filledBlocks = Math.round((Math.max(0, Math.min(100, value)) / 100) * totalBlocks);
  const emptyBlocks = totalBlocks - filledBlocks;

  const colorClass = {
    green: 'text-emerald-400',
    orange: 'text-orange-500',
    purple: 'text-purple-400',
    cyan: 'text-cyan-400',
    rose: 'text-rose-500',
  }[color];

  return (
    <div className="flex items-center justify-between gap-3 text-xs font-mono">
      <span className="text-zinc-400 uppercase tracking-wider min-w-[110px] truncate">{label}</span>
      <div className="flex items-center gap-1.5 flex-1 justify-end">
        <span className={`${colorClass} tracking-widest text-sm select-none`}>
          {'█'.repeat(filledBlocks)}
          <span className="text-zinc-800">{'░'.repeat(emptyBlocks)}</span>
        </span>
        <span className="text-zinc-100 font-bold min-w-[28px] text-right font-mono">
          {Math.round(value)}
        </span>
      </div>
    </div>
  );
}
