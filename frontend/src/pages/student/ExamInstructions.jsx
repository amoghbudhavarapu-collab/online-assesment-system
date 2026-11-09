import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getExamination, startExamination } from '../../lib/api/examinations';
import { getErrorMessage } from '../../utils/errors';
import { formatDateTime, formatDuration } from '../../utils/datetime';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';
import { Button } from '../../components/forms/Field';

const defaults = [
  'Read all questions carefully.',
  'The examination has a fixed time limit enforced by the server.',
  'Answers are saved automatically as you move between questions.',
  'You cannot start before the scheduled window.',
  'When time expires the attempt is submitted automatically.',
  'Do not close the browser if you can avoid it; saved answers can be recovered.',
  'Only one attempt is allowed per examination.'
];

export default function ExamInstructions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['examination', id], queryFn: () => getExamination(id) });

  const start = useMutation({
    mutationFn: () => startExamination(id),
    onSuccess: (attempt) => {
      const attemptId = attempt.attemptId || attempt._id;
      navigate(`/student/attempt/${attemptId}`);
    },
    onError: (e) => toast.error(getErrorMessage(e))
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  const already = data.studentStatus === 'in_progress' || data.attemptId;

  return (
    <div className="space-y-6">
      <PageHeader title={data.title} description={data.subject} />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Duration</p><p className="mt-2 font-semibold">{formatDuration(data.duration)}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Total marks</p><p className="mt-2 font-semibold">{data.totalMarks}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Status</p><div className="mt-2"><StatusBadge value={data.studentStatus || data.status} /></div></div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold">Window</h2>
        <p className="mt-1 text-sm text-slate-600">{formatDateTime(data.startTime)} → {formatDateTime(data.endTime)}</p>
        <h2 className="mt-6 font-semibold">Instructions</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{data.instructions}</p>
        <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-slate-600">
          {defaults.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
        <label className="mt-6 flex items-start gap-2 text-sm">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-1" />
          I have read the instructions and understand that this is my only attempt.
        </label>
        <div className="mt-6">
          {data.studentStatus === 'submitted' || data.studentStatus === 'auto_submitted' ? (
            <p className="text-sm text-slate-600">You have already submitted this examination.</p>
          ) : data.studentStatus === 'upcoming' ? (
            <p className="text-sm text-slate-600">This examination has not started yet.</p>
          ) : data.studentStatus === 'missed' ? (
            <p className="text-sm text-slate-600">The start window has closed.</p>
          ) : (
            <Button disabled={!confirmed && data.studentStatus !== 'in_progress'} loading={start.isPending} onClick={() => start.mutate()}>
              {data.studentStatus === 'in_progress' || already ? 'Resume examination' : 'Start examination'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
