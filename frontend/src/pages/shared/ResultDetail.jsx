import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getResult } from '../../lib/api/results';
import { getErrorMessage } from '../../utils/errors';
import { formatDateTime } from '../../utils/datetime';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import DashboardCard from '../../components/common/DashboardCard';

export default function ResultDetail() {
  const { id } = useParams();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['result', id], queryFn: () => getResult(id) });
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader title={data.examination?.title} description={`${data.student?.name} · submitted ${formatDateTime(data.submittedAt)}`} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard label="Score" value={`${data.marksObtained} / ${data.totalMarks}`} />
        <DashboardCard label="Percentage" value={`${data.percentage}%`} />
        <DashboardCard label="Result" value={<StatusBadge value={data.resultStatus} />} />
        <DashboardCard label="Attempted" value={`${data.attemptedQuestions}/${data.totalQuestions}`} hint={`${data.correctAnswers} correct · ${data.incorrectAnswers} incorrect · ${data.unansweredQuestions} blank`} />
      </div>
      <div className="space-y-4">
        {(data.questions || []).map((q, i) => (
          <div key={q.questionId} className={`rounded-2xl border p-5 ${q.isCorrect ? 'border-emerald-100 bg-emerald-50/40' : 'border-slate-200 bg-white'}`}>
            <p className="text-sm text-slate-500">Question {i + 1} · {q.marksAwarded}/{q.marks} marks</p>
            <p className="mt-1 font-medium">{q.questionText}</p>
            <p className="mt-2 text-sm">Your answer: {Array.isArray(q.selectedAnswer) ? q.selectedAnswer.join(', ') : String(q.selectedAnswer ?? '—')}</p>
            <p className="text-sm">Correct answer: {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : String(q.correctAnswer)}</p>
            {q.explanation && <p className="mt-2 text-sm text-slate-600">{q.explanation}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
