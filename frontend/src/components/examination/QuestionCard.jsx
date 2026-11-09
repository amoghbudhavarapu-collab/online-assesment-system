function OptionList({ question, value, onChange, multiple }) {
  const options = question.options || [];
  const selected = multiple ? (Array.isArray(value) ? value : []) : value;

  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const checked = multiple ? selected.includes(opt) : selected === opt;
        return (
          <label
            key={opt}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 ${
              checked ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white'
            }`}
          >
            <input
              type={multiple ? 'checkbox' : 'radio'}
              name={question.questionId}
              checked={checked}
              onChange={() => {
                if (multiple) {
                  const next = checked ? selected.filter((v) => v !== opt) : [...selected, opt];
                  onChange(next);
                } else {
                  onChange(opt);
                }
              }}
              className="mt-1"
            />
            <span>{opt}</span>
          </label>
        );
      })}
    </div>
  );
}

export default function QuestionCard({ question, index, total, value, marked, onChange, onMark, disabled }) {
  const type = question.questionType;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
        <span>
          Question {index + 1} of {total}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
          {question.marks} mark{question.marks === 1 ? '' : 's'}
          {question.negativeMarks ? ` · −${question.negativeMarks}` : ''}
        </span>
      </div>
      <h2 className="text-lg font-semibold leading-relaxed text-slate-900">{question.questionText}</h2>
      <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">{type.replaceAll('_', ' ')}</p>

      <div className="mt-6">
        {type === 'FILL_BLANKS' ? (
          <input
            disabled={disabled}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your answer"
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          />
        ) : type === 'TRUE_FALSE' ? (
          <OptionList
            question={{ ...question, options: question.options?.length ? question.options : ['true', 'false'] }}
            value={typeof value === 'boolean' ? String(value) : value}
            onChange={onChange}
          />
        ) : (
          <OptionList question={question} value={value} onChange={onChange} multiple={type === 'MULTIPLE_SELECT'} disabled={disabled} />
        )}
      </div>

      <label className="mt-6 flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" checked={!!marked} disabled={disabled} onChange={(e) => onMark(e.target.checked)} />
        Mark for review
      </label>
    </div>
  );
}
