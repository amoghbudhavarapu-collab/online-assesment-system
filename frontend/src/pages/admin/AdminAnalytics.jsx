import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getAdminDashboard } from '../../lib/api/dashboard';
import { getErrorMessage } from '../../utils/errors';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';

const COLORS = ['#4f46e5', '#0ea5e9', '#10b981'];

export default function AdminAnalytics() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['dashboard', 'admin'], queryFn: getAdminDashboard });
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  const examBars = [
    { name: 'Upcoming', count: data.examinations?.upcoming || 0 },
    { name: 'Live', count: data.examinations?.live || 0 },
    { name: 'Completed', count: data.examinations?.completed || 0 }
  ];
  const users = [
    { name: 'Students', value: data.summary?.totalStudents || 0 },
    { name: 'Teachers', value: data.summary?.totalTeachers || 0 },
    { name: 'Attempts', value: data.summary?.totalAttempts || 0 }
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Platform analytics" description="Participation and examination completion at a glance." />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-semibold">Examination lifecycle</h2>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={examBars}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-semibold">Platform mix</h2>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={users} dataKey="value" nameKey="name" outerRadius={90}>
                  {users.map((entry, i) => (
                    <Cell key={entry.name} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
