export default function FilterDropdown({ value, onChange, options, label }) {
  return (
    <label className="text-sm text-slate-600">
      {label && <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
