export function ConvexiaBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

      {/* Diagonal banding effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-700/20 to-transparent transform rotate-12 scale-150" />
      </div>

      {/* Emerald blob 1 */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />

      {/* Teal blob 2 */}
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Additional subtle overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-slate-900/50" />
    </div>
  )
}
