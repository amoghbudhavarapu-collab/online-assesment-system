import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cancelExamination, deleteExamination, getExamination, publishExamination } from '../../lib/api/examinations';
import { getErrorMessage } from '../../utils/errors';
import { formatDateTime, formatDuration } from '../../utils/datetime';
import { useAuth } from '../../auth/AuthProvider';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import { Button } from '../../components/forms/Field';

export default function ExamDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const base = user.role === 'admin' ? '/admin' : '/teacher';
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['examination', id], queryFn: () => getExamination(id) });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['examination', id] });

  const publish = useMutation({
    mutationFn: () => publishExamination(id),
    onSuccess: () => { toast.success('Examination published'); invalidate(); },
    onError: (e) => toast.error(getErrorMessage(e))
  });
  const cancel = useMutation({
    mutationFn: () => cancelExamination(id),
    onSuccess: () => { toast.success('Examination cancelled'); invalidate(); },
    onError: (e) => toast.error(getErrorMessage(e))
  });
  const remove = useMutation({
    mutationFn: () => deleteExamination(id),
    onSuccess: () => {
      toast.success('Draft deleted');
      navigate(`${base}/examinations`);
    },
    onError: (e) => toast.error(getErrorMessage(e))
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.title}
        description={data.subject}
        actions={
          <>
            {data.status === 'draft' && (
              <>
                <Link to={`/teacher/examinations/${id}/edit`}><Button variant="secondary">Edit / schedule</Button></Link>
                <Button onClick={() => publish.mutate()} loading={publish.isPending}>Publish</Button>
                <Button variant="danger" onClick={() => remove.mutate()} loading={remove.isPending}>Delete draft</Button>
              </>
            )}
            {['scheduled', 'live'].includes(data.status) && (
              <Button variant="danger" onClick={() => cancel.mutate()} loading={cancel.isPending}>Cancel</Button>
            )}
            <Link to={`${base}/examinations/${id}/results`}><Button variant="secondary">Results</Button></Link>
          </>
        }
      />
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Status</p><div className="mt-2"><StatusBadge value={data.status} /></div></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Duration</p><p className="mt-2 font-semibold">{formatDuration(data.duration)}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Marks</p><p className="mt-2 font-semibold">{data.totalMarks} total · {data.passingMarks} pass</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Window</p><p className="mt-2 text-sm">{formatDateTime(data.startTime)} → {formatDateTime(data.endTime)}</p></div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold">Instructions</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{data.instructions}</p>
        <p className="mt-4 text-sm text-slate-500">{data.description}</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-semibold">Questions ({data.questions?.length || 0})</h2>
        <ol className="space-y-3">
          {(data.questions || []).map((q, i) => (
            <li key={q.questionId || i} className="rounded-xl bg-slate-50 p-3">
              <p className="font-medium">{i + 1}. {q.questionText}</p>
              <p className="text-xs text-slate-500">{q.questionType} · {q.marks} marks</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
