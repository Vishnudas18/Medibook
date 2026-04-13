import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Page not found</h2>
        <p className="text-sm text-slate-500">
          The page you are looking for does not exist or may have moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Go to homepage
        </Link>
      </div>
    </main>
  );
}
