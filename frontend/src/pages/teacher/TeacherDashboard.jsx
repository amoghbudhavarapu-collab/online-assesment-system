import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { HelpCircle, FileText, ClipboardList, Percent } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getTeacherDashboard } from '../../lib/api/dashboard';
import { getErrorMessage } from '../../utils/errors';
import PageHeader from '../../components/common/PageHeader';
import DashboardCard from '../../components/common/DashboardCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';
import { Button } from '../../components/forms/Field';

const COLORS = ['#10b981', '#e11d48'];

export default function TeacherDashboard() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['dashboard', 'teacher'], queryFn: getTeacherDashboard });
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  const chart = [
    { name: 'Passed', value: data.performance?.passed || 0 },
    { name: 'Failed', value: data.performance?.failed || 0 }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teacher dashboard"
        description="Your questions, examinations, and student performance."
        actions={
          <>
            <Link to="/teacher/questions/new"><Button>New question</Button></Link>
            <Link to="/teacher/examinations/new"><Button variant="secondary">New examination</Button></Link>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard label="Questions" value={data.summary?.totalQuestions} icon={HelpCircle} />
        <DashboardCard label="Examinations" value={data.summary?.totalExaminations} icon={FileText} />
        <DashboardCard label="Student attempts" value={data.summary?.totalAttempts} icon={ClipboardList} />
        <DashboardCard label="Average score" value={data.summary?.averageScore} icon={Percent} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard label="Upcoming" value={data.examinations?.upcoming} />
        <DashboardCard label="Live" value={data.examinations?.live} />
        <DashboardCard label="Completed" value={data.examinations?.completed} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-semibold">Pass / fail</h2>
          <div className="h-64">
            <ResponsiveContainer>
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
              <Link key={exam._id} to={`/teacher/examinations/${exam._id}`} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3">
                <div>
                  <p className="font-medium">{exam.title}</p>
                  <p className="text-xs text-slate-500">{exam.subject}</p>
                </div>
                <StatusBadge value={exam.status} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
