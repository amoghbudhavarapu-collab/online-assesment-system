import { useQuery } from '@tanstack/react-query';
import { Users, GraduationCap, FileText, ClipboardList } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getAdminDashboard } from '../../lib/api/dashboard';
import { getErrorMessage } from '../../utils/errors';
import { formatDateTime } from '../../utils/datetime';
import PageHeader from '../../components/common/PageHeader';
import DashboardCard from '../../components/common/DashboardCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';

const COLORS = ['#4f46e5', '#e11d48'];

export default function AdminDashboard() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['dashboard', 'admin'], queryFn: getAdminDashboard });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  const chart = [
    { name: 'Passed', value: data.evaluation?.passed || 0 },
    { name: 'Failed', value: data.evaluation?.failed || 0 }
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Administrator dashboard" description="Platform-wide activity and examination health." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard label="Students" value={data.summary?.totalStudents} icon={GraduationCap} />
        <DashboardCard label="Teachers" value={data.summary?.totalTeachers} icon={Users} />
        <DashboardCard label="Examinations" value={data.summary?.totalExaminations} icon={FileText} />
        <DashboardCard label="Attempts" value={data.summary?.totalAttempts} icon={ClipboardList} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard label="Upcoming exams" value={data.examinations?.upcoming} />
        <DashboardCard label="Live exams" value={data.examinations?.live} />
        <DashboardCard label="Completed exams" value={data.examinations?.completed} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-semibold">Pass / fail distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chart} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                  {chart.map((entry, i) => (
                    <Cell key={entry.name} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-semibold">Recent examinations</h2>
          <div className="space-y-3">
            {(data.recentExaminations || []).map((exam) => (
              <div key={exam._id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3">
                <div>
                  <p className="font-medium">{exam.title}</p>
                  <p className="text-xs text-slate-500">
                    {exam.subject} · {exam.creator} · {formatDateTime(exam.startTime)}
                  </p>
                </div>
                <StatusBadge value={exam.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
