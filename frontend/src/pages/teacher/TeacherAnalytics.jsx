import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getTeacherDashboard } from '../../lib/api/dashboard';
import { getErrorMessage } from '../../utils/errors';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import DashboardCard from '../../components/common/DashboardCard';

export default function TeacherAnalytics() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['dashboard', 'teacher'], queryFn: getTeacherDashboard });
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  const bars = [
    { name: 'Upcoming', count: data.examinations?.upcoming || 0 },
    { name: 'Live', count: data.examinations?.live || 0 },
    { name: 'Completed', count: data.examinations?.completed || 0 }
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Performance analytics" description="Examination-wise activity from your dashboard metrics." />
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard label="Average score" value={data.summary?.averageScore} />
        <DashboardCard label="Pass rate" value={`${data.performance?.passPercentage || 0}%`} />
        <DashboardCard label="Attempts" value={data.summary?.totalAttempts} />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-semibold">Examination status</h2>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={bars}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#4f46e5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
