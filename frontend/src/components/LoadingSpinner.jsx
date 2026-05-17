// Small reusable loading state used across the dashboard pages.
export default function LoadingSpinner({ label = 'Loading data...' }) {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-slate-300 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-400/25 border-t-cyan-400" />
        <p className="text-sm font-medium tracking-wide">{label}</p>
      </div>
    </div>
  );
}
