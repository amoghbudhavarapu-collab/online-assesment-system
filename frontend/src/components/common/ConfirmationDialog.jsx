export default function ConfirmationDialog({ open, title, message, confirmLabel = 'Confirm', tone = 'indigo', onConfirm, onCancel, busy }) {
  if (!open) return null;
  const color = tone === 'rose' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold">{title}</h2>
        {typeof message === 'string' ? <p className="mt-2 text-sm text-slate-600">{message}</p> : <div className="mt-2 text-sm text-slate-600">{message}</div>}
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium">
            Cancel
          </button>
          <button disabled={busy} onClick={onConfirm} className={`rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${color}`}>
            {busy ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
