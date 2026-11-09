import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMyResults } from '../../lib/api/results';
import { getErrorMessage } from '../../utils/errors';
import { formatDateTime } from '../../utils/datetime';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';

export default function StudentResults() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['my-results'], queryFn: getMyResults });
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader title="Published results" description="Only examinations whose results have been released are listed here." />
      <div className="rounded-2xl border border-slate-200 bg-white p-2">
        <DataTable
          rows={data || []}
          rowKey="attemptId"
          columns={[
            { key: 'examinationTitle', header: 'Examination' },
            { key: 'subject', header: 'Subject' },
            { key: 'marksObtained', header: 'Score', render: (r) => `${r.marksObtained} / ${r.totalMarks}` },
            { key: 'percentage', header: '%', render: (r) => `${r.percentage}%` },
            { key: 'resultStatus', header: 'Result', render: (r) => <StatusBadge value={r.resultStatus} /> },
            { key: 'submittedAt', header: 'Submitted', render: (r) => formatDateTime(r.submittedAt) },
            { key: 'open', header: '', render: (r) => <Link className="font-medium text-indigo-700" to={`/student/results/${r.attemptId}`}>Details</Link> }
          ]}
        />
      </div>
    </div>
  );
}
