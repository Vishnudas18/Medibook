export default function Loading() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-slate-900">Loading Medibook...</p>
        <p className="text-sm text-slate-500">Please wait while we fetch your data.</p>
      </div>
    </main>
  );
}
