const tones = {
  draft: 'bg-slate-100 text-slate-700',
  scheduled: 'bg-sky-50 text-sky-700',
  live: 'bg-emerald-50 text-emerald-700',
  completed: 'bg-indigo-50 text-indigo-700',
  results_published: 'bg-violet-50 text-violet-700',
  cancelled: 'bg-rose-50 text-rose-700',
  pass: 'bg-emerald-50 text-emerald-700',
  fail: 'bg-rose-50 text-rose-700',
  in_progress: 'bg-amber-50 text-amber-700',
  submitted: 'bg-indigo-50 text-indigo-700',
  auto_submitted: 'bg-slate-100 text-slate-700',
  eligible: 'bg-emerald-50 text-emerald-700',
  upcoming: 'bg-sky-50 text-sky-700',
  missed: 'bg-rose-50 text-rose-700',
  easy: 'bg-emerald-50 text-emerald-700',
  medium: 'bg-amber-50 text-amber-700',
  hard: 'bg-rose-50 text-rose-700',
  admin: 'bg-slate-800 text-white',
  teacher: 'bg-indigo-50 text-indigo-700',
  student: 'bg-sky-50 text-sky-700',
  active: 'bg-emerald-50 text-emerald-700',
  inactive: 'bg-rose-50 text-rose-700',
  default: 'bg-slate-100 text-slate-700'
};

export default function StatusBadge({ value, children }) {
  const key = String(value || 'default').toLowerCase();
  const label = children || String(value || '').replaceAll('_', ' ');
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${tones[key] || tones.default}`}>
      {label}
    </span>
  );
}
