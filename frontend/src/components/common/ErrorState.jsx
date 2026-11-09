export default function ErrorState({ title = 'Unable to load this page', message, onRetry }) {
  return (
    <div className="rounded-2xl border border-rose-100 bg-rose-50 px-6 py-10 text-center">
      <h3 className="text-lg font-semibold text-rose-800">{title}</h3>
      {message && <p className="mt-2 text-sm text-rose-700">{message}</p>}
      {onRetry && (
        <button onClick={onRetry} className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm">
          Try again
        </button>
      )}
    </div>
  );
}
