import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAvailableExaminations } from '../../lib/api/examinations';
import { getErrorMessage } from '../../utils/errors';
import { formatDateTime, formatDuration } from '../../utils/datetime';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

export default function AvailableExams({ upcomingOnly = false }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['examinations', 'available'],
    queryFn: getAvailableExaminations
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  const exams = (data || []).filter((exam) => (upcomingOnly ? exam.studentStatus === 'upcoming' : exam.studentStatus !== 'upcoming'));

  return (
    <div className="space-y-6">
      <PageHeader
        title={upcomingOnly ? 'Upcoming examinations' : 'Available examinations'}
        description={upcomingOnly ? 'These papers are assigned but the start window has not opened.' : 'Live and completed papers assigned to you.'}
      />
      {!exams.length ? (
        <EmptyState title="No examinations" description="When a teacher publishes an exam for you, it will appear here." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {exams.map((exam) => (
            <Link key={exam._id} to={`/student/exams/${exam._id}`} className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-indigo-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{exam.title}</h3>
                  <p className="text-sm text-slate-500">{exam.subject}</p>
                </div>
                <StatusBadge value={exam.studentStatus || exam.status} />
              </div>
              <p className="mt-4 text-sm text-slate-600">{formatDuration(exam.duration)} · {exam.totalMarks} marks</p>
              <p className="mt-1 text-xs text-slate-500">{formatDateTime(exam.startTime)} → {formatDateTime(exam.endTime)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
