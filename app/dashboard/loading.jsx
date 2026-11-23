export default function DashboardLoading() {
  return (
    <div className="w-full py-16 flex items-center justify-center">
      <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white border border-sage/60 shadow-sm text-xs font-semibold text-charcoal">
        <div className="w-4 h-4 border-2 border-forest border-t-transparent rounded-full animate-spin"></div>
        <span>Updating terminal data...</span>
      </div>
    </div>
  );
}
