export default function Loading() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-sage/40 overflow-hidden pointer-events-none">
      <div className="h-full bg-emerald animate-[pulse_1s_ease-in-out_infinite] w-3/4"></div>
    </div>
  );
}
