import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listExaminations } from '../../lib/api/examinations';
import { getErrorMessage } from '../../utils/errors';
import { formatDateTime, formatDuration } from '../../utils/datetime';
import PageHeader from '../../components/common/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import FilterDropdown from '../../components/common/FilterDropdown';
import Pagination from '../../components/common/Pagination';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import { Button } from '../../components/forms/Field';

export default function ExamList() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ['examinations', 'teacher', { search, status, page }],
    queryFn: () => listExaminations({ search: search || undefined, status: status || undefined, page, limit: 20 })
  });

  if (query.isLoading) return <LoadingSpinner />;
  if (query.error) return <ErrorState message={getErrorMessage(query.error)} onRetry={query.refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Examinations"
        description="Create drafts, schedule windows, publish, and review results."
        actions={<Link to="/teacher/examinations/new"><Button>Create examination</Button></Link>}
      />
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
        <FilterDropdown
          value={status}
          onChange={(v) => { setStatus(v); setPage(1); }}
          options={[
            { value: '', label: 'All statuses' },
            { value: 'draft', label: 'Draft' },
            { value: 'scheduled', label: 'Scheduled' },
            { value: 'live', label: 'Live' },
            { value: 'completed', label: 'Completed' },
            { value: 'results_published', label: 'Results published' },
            { value: 'cancelled', label: 'Cancelled' }
          ]}
        />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-2">
        <DataTable
          rows={query.data.data}
          columns={[
            { key: 'title', header: 'Title', render: (e) => <Link className="font-medium text-indigo-700" to={`/teacher/examinations/${e._id}`}>{e.title}</Link> },
            { key: 'subject', header: 'Subject' },
            { key: 'duration', header: 'Duration', render: (e) => formatDuration(e.duration) },
            { key: 'startTime', header: 'Window', render: (e) => `${formatDateTime(e.startTime)} → ${formatDateTime(e.endTime)}` },
            { key: 'status', header: 'Status', render: (e) => <StatusBadge value={e.status} /> }
          ]}
        />
      </div>
      <Pagination pagination={query.data.pagination} onPage={setPage} />
    </div>
  );
}
