import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMyAttempts } from '../../lib/api/attempts';
import { getErrorMessage } from '../../utils/errors';
import { formatDateTime } from '../../utils/datetime';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';

export default function ExamHistory() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['my-attempts'], queryFn: getMyAttempts });
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader title="Examination history" description="Every attempt you have started or submitted." />
      <div className="rounded-2xl border border-slate-200 bg-white p-2">
        <DataTable
          rows={data || []}
          columns={[
            { key: 'exam', header: 'Examination', render: (a) => a.examination?.title || a.examinationTitle || 'Examination' },
            { key: 'status', header: 'Status', render: (a) => <StatusBadge value={a.status} /> },
            { key: 'submittedAt', header: 'Submitted', render: (a) => formatDateTime(a.submittedAt) },
            {
              key: 'score',
              header: 'Score',
              render: (a) => (a.examination?.resultsPublished || a.resultsPublished ? `${a.marksObtained} / ${a.examination?.totalMarks}` : 'Pending publication')
            },
            {
              key: 'open',
              header: '',
              render: (a) =>
                a.status === 'in_progress' ? (
                  <Link className="font-medium text-indigo-700" to={`/student/attempt/${a._id}`}>Resume</Link>
                ) : (
                  <Link className="font-medium text-indigo-700" to={`/student/results/${a._id}`}>View</Link>
                )
            }
          ]}
        />
      </div>
    </div>
  );
}
