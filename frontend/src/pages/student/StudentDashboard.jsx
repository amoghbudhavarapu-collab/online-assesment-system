import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getStudentDashboard } from '../../lib/api/dashboard';
import { getErrorMessage } from '../../utils/errors';
import { formatDateTime } from '../../utils/datetime';
import PageHeader from '../../components/common/PageHeader';
import DashboardCard from '../../components/common/DashboardCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';

export default function StudentDashboard() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['dashboard', 'student'], queryFn: getStudentDashboard });
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  const recent = data.recentResults || [];
  const lineData = recent
    .slice()
    .reverse()
    .map((r) => ({ name: r.subject || 'Exam', percentage: r.percentage }));

  return (
    <div className="space-y-6">
      <PageHeader title="Student dashboard" description="Upcoming exams, live papers, and published scores." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard label="Attended" value={data.summary?.totalAttended} />
        <DashboardCard label="Average %" value={data.summary?.averagePercentage} />
        <DashboardCard label="Highest score" value={data.summary?.highestScore} />
        <DashboardCard label="Live now" value={data.summary?.liveExaminations} hint={`${data.summary?.upcomingExaminations || 0} upcoming`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-semibold">Performance over time</h2>
          <div className="h-64">
            {lineData.length ? (
              <ResponsiveContainer>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="percentage" stroke="#4f46e5" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-500">Published results will appear here.</p>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-semibold">Subject comparison</h2>
          <div className="h-64">
            {lineData.length ? (
              <ResponsiveContainer>
                <BarChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="percentage" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-500">No published scores yet.</p>
            )}
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-semibold">Recent results</h2>
        <div className="space-y-3">
          {recent.map((r) => (
            <Link key={r.attemptId} to={`/student/results/${r.attemptId}`} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3">
              <div>
                <p className="font-medium">{r.examinationTitle}</p>
                <p className="text-xs text-slate-500">{r.subject} · {formatDateTime(r.submittedAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">{r.marksObtained}/{r.totalMarks}</span>
                <StatusBadge value={r.resultStatus} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
