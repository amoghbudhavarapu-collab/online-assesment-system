import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getQuestion } from '../../lib/api/questions';
import { getErrorMessage } from '../../utils/errors';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';
import { Button } from '../../components/forms/Field';

export default function QuestionPreview() {
  const { id } = useParams();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['question', id], queryFn: () => getQuestion(id) });
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Question preview"
        actions={<Link to={`/teacher/questions/${id}/edit`}><Button>Edit</Button></Link>}
      />
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          <StatusBadge value={data.difficulty} />
          <StatusBadge value={data.questionType} />
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{data.marks} marks</span>
        </div>
        <h2 className="text-xl font-semibold">{data.questionText}</h2>
        <p className="mt-2 text-sm text-slate-500">{data.category}</p>
        {!!data.options?.length && (
          <ul className="mt-4 space-y-2">
            {data.options.map((opt) => (
              <li key={opt} className="rounded-xl border border-slate-200 px-4 py-2">{opt}</li>
            ))}
          </ul>
        )}
        <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">Correct answer</p>
          <p>{Array.isArray(data.correctAnswer) ? data.correctAnswer.join(', ') : String(data.correctAnswer)}</p>
          {data.explanation && <p className="mt-2">{data.explanation}</p>}
        </div>
      </div>
    </div>
  );
}
