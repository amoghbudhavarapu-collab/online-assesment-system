export default function QuestionNavigation({ questions, currentIndex, onSelect }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="mb-3 text-sm font-semibold">Questions</p>
      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, i) => {
          const answered = q.isAnswered;
          const marked = q.isMarkedForReview;
          let cls = 'border-slate-200 bg-white text-slate-600';
          if (answered) cls = 'border-emerald-200 bg-emerald-50 text-emerald-800';
          if (marked) cls = 'border-amber-200 bg-amber-50 text-amber-800';
          if (i === currentIndex) cls = 'border-indigo-600 bg-indigo-600 text-white';
          return (
            <button
              key={q.questionId}
              onClick={() => onSelect(i)}
              className={`h-10 rounded-lg border text-sm font-semibold ${cls}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <div className="mt-4 space-y-1 text-xs text-slate-500">
        <p>Green: answered · Amber: marked for review · Blue: current</p>
      </div>
    </div>
  );
}
