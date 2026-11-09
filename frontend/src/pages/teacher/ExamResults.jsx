import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getExaminationResults, publishResults, downloadResultsCsv } from '../../lib/api/results';
import { getErrorMessage } from '../../utils/errors';
import { useAuth } from '../../auth/AuthProvider';
import PageHeader from '../../components/common/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import FilterDropdown from '../../components/common/FilterDropdown';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import DashboardCard from '../../components/common/DashboardCard';
import { Button } from '../../components/forms/Field';

export default function ExamResults() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const base = user.role === 'admin' ? '/admin' : '/teacher';
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('marksObtained');

  const query = useQuery({
    queryKey: ['exam-results', id, { search, status, sortBy }],
    queryFn: () => getExaminationResults(id, { search: search || undefined, status: status || undefined, sortBy, order: 'desc', page: 1, limit: 100 })
  });

  const publish = useMutation({
    mutationFn: () => publishResults(id),
    onSuccess: () => {
      toast.success('Results published');
      queryClient.invalidateQueries({ queryKey: ['exam-results', id] });
    },
    onError: (e) => toast.error(getErrorMessage(e))
  });

  if (query.isLoading) return <LoadingSpinner />;
  if (query.error) return <ErrorState message={getErrorMessage(query.error)} onRetry={query.refetch} />;

  const { examination, stats, attempts } = query.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${examination.title} results`}
        description={examination.resultsPublished ? 'Visible to students.' : 'Not yet visible to students.'}
        actions={
          <>
            {!examination.resultsPublished && <Button onClick={() => publish.mutate()} loading={publish.isPending}>Publish results</Button>}
            <Button variant="secondary" onClick={() => downloadResultsCsv(id, `${examination.title}-results.csv`).catch((e) => toast.error(getErrorMessage(e)))}>Export CSV</Button>
          </>
        }
      />
      <div className="grid gap-4 md:grid-cols-4">
        <DashboardCard label="Attempts" value={stats.totalAttendees} />
        <DashboardCard label="Passed" value={stats.passed} />
        <DashboardCard label="Failed" value={stats.failed} />
        <DashboardCard label="Average" value={stats.averageScore} hint={`Highest ${stats.highestScore}`} />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchBar value={search} onChange={setSearch} placeholder="Search student" />
        <FilterDropdown value={status} onChange={setStatus} options={[{ value: '', label: 'All' }, { value: 'pass', label: 'Pass' }, { value: 'fail', label: 'Fail' }]} />
        <FilterDropdown value={sortBy} onChange={setSortBy} options={[{ value: 'marksObtained', label: 'Marks' }, { value: 'percentage', label: 'Percentage' }, { value: 'submittedAt', label: 'Submitted' }]} />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-2">
        <DataTable
          rows={attempts}
          rowKey="attemptId"
          columns={[
            { key: 'student', header: 'Student', render: (a) => <div><p className="font-medium">{a.student?.name}</p><p className="text-xs text-slate-500">{a.student?.email}</p></div> },
            { key: 'marksObtained', header: 'Score', render: (a) => `${a.marksObtained} / ${a.totalMarks}` },
            { key: 'percentage', header: '%', render: (a) => `${a.percentage}%` },
            { key: 'resultStatus', header: 'Result', render: (a) => <StatusBadge value={a.resultStatus} /> },
            { key: 'view', header: '', render: (a) => <Link className="text-sm font-medium text-indigo-700" to={`${base}/results/${a.attemptId}`}>Details</Link> }
          ]}
        />
      </div>
    </div>
  );
}
