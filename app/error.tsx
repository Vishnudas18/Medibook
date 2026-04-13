'use client';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorPageProps) {
  console.error(error);

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Something went wrong</h2>
        <p className="text-sm text-slate-500">
          We could not load this page right now. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
