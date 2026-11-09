import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listExaminations } from '../../lib/api/examinations';
import { getErrorMessage } from '../../utils/errors';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';

export default function AdminResultsOverview() {
  const query = useQuery({
    queryKey: ['examinations', 'results-overview'],
    queryFn: () => listExaminations({ limit: 50, page: 1 })
  });
  if (query.isLoading) return <LoadingSpinner />;
  if (query.error) return <ErrorState message={getErrorMessage(query.error)} onRetry={query.refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader title="Results overview" description="Open an examination to view attempts, publish, or export CSV." />
      <div className="rounded-2xl border border-slate-200 bg-white p-2">
        <DataTable
          rows={query.data.data}
          columns={[
            { key: 'title', header: 'Examination', render: (e) => e.title },
            { key: 'subject', header: 'Subject' },
            { key: 'status', header: 'Status', render: (e) => <StatusBadge value={e.status} /> },
            { key: 'open', header: '', render: (e) => <Link className="font-medium text-indigo-700" to={`/admin/examinations/${e._id}/results`}>View results</Link> }
          ]}
        />
      </div>
    </div>
  );
}
