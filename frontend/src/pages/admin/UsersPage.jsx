import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { listUsers, updateUser, updateUserStatus } from '../../lib/api/users';
import { getErrorMessage } from '../../utils/errors';
import { formatDateTime } from '../../utils/datetime';
import PageHeader from '../../components/common/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import FilterDropdown from '../../components/common/FilterDropdown';
import Pagination from '../../components/common/Pagination';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';

export default function UsersPage({ roleFilter = '', title = 'Manage users', description = 'Search accounts, assign roles, and activate or deactivate users.' }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState(roleFilter);
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ['users', { search, role, page }],
    queryFn: () => listUsers({ search: search || undefined, role: role || undefined, page, limit: 20 })
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, nextRole }) => updateUser(id, { role: nextRole }),
    onSuccess: () => {
      toast.success('Role updated');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (e) => toast.error(getErrorMessage(e))
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }) => updateUserStatus(id, isActive),
    onSuccess: () => {
      toast.success('Account status updated');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (e) => toast.error(getErrorMessage(e))
  });

  if (query.isLoading) return <LoadingSpinner />;
  if (query.error) return <ErrorState message={getErrorMessage(query.error)} onRetry={query.refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search name or email" />
        {!roleFilter && (
          <FilterDropdown
            value={role}
            onChange={(v) => { setRole(v); setPage(1); }}
            options={[
              { value: '', label: 'All roles' },
              { value: 'student', label: 'Students' },
              { value: 'teacher', label: 'Teachers' },
              { value: 'admin', label: 'Admins' }
            ]}
          />
        )}
      </div>
      <p className="text-sm text-slate-500">
        Teacher accounts are authorized here: register a student, then assign the teacher role.
      </p>
      <div className="rounded-2xl border border-slate-200 bg-white p-2">
        <DataTable
          rows={query.data.data}
          columns={[
            { key: 'name', header: 'Name', render: (u) => <div><p className="font-medium">{u.name}</p><p className="text-xs text-slate-500">{u.email}</p></div> },
            { key: 'role', header: 'Role', render: (u) => <StatusBadge value={u.role} /> },
            { key: 'isActive', header: 'Status', render: (u) => <StatusBadge value={u.isActive ? 'active' : 'inactive'} /> },
            { key: 'createdAt', header: 'Created', render: (u) => formatDateTime(u.createdAt) },
            {
              key: 'actions',
              header: 'Actions',
              render: (u) => (
                <div className="flex flex-wrap gap-2">
                  <select
                    value={u.role}
                    onChange={(e) => roleMutation.mutate({ id: u._id, nextRole: e.target.value })}
                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                  >
                    <option value="student">student</option>
                    <option value="teacher">teacher</option>
                    <option value="admin">admin</option>
                  </select>
                  <button
                    onClick={() => statusMutation.mutate({ id: u._id, isActive: !u.isActive })}
                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                  >
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              )
            }
          ]}
        />
      </div>
      <Pagination pagination={query.data.pagination} onPage={setPage} />
    </div>
  );
}
