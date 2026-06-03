export default function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl transition-all duration-300 hover:border-teal-500/30 hover:bg-white/[0.06]">
      <div className="relative z-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 transition-colors group-hover:text-teal-400/80">{label}</p>
        <p className="mt-3 text-4xl font-black tracking-tight text-white">{value}</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-400 group-hover:text-slate-300">{detail}</p>
      </div>
      
      {/* Decorative background element */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-teal-500/5 blur-3xl transition-colors group-hover:bg-teal-500/10" />
    </div>
  );
}
