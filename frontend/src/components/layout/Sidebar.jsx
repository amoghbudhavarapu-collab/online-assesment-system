import { NavLink } from 'react-router-dom';
import {
  BookOpenCheck,
  LayoutDashboard,
  FileText,
  Users,
  ClipboardList,
  GraduationCap,
  HelpCircle,
  BarChart3,
  UserRound,
  CalendarClock
} from 'lucide-react';

const nav = {
  admin: [
    ['/admin', 'Overview', LayoutDashboard],
    ['/admin/users', 'All users', Users],
    ['/admin/students', 'Students', GraduationCap],
    ['/admin/teachers', 'Teachers', UserRound],
    ['/admin/examinations', 'Examinations', FileText],
    ['/admin/results', 'Results', ClipboardList],
    ['/admin/analytics', 'Analytics', BarChart3],
    ['/admin/profile', 'Profile', UserRound]
  ],
  teacher: [
    ['/teacher', 'Overview', LayoutDashboard],
    ['/teacher/questions', 'Question bank', HelpCircle],
    ['/teacher/examinations', 'Examinations', FileText],
    ['/teacher/analytics', 'Analytics', BarChart3],
    ['/teacher/profile', 'Profile', UserRound]
  ],
  student: [
    ['/student', 'Overview', LayoutDashboard],
    ['/student/exams', 'Available exams', FileText],
    ['/student/exams/upcoming', 'Upcoming', CalendarClock],
    ['/student/history', 'History', ClipboardList],
    ['/student/results', 'Results', BarChart3],
    ['/student/profile', 'Profile', UserRound]
  ]
};

export default function Sidebar({ role, name }) {
  const links = nav[role] || nav.student;
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
        <BookOpenCheck className="text-indigo-600" size={28} />
        <div>
          <p className="text-lg font-bold leading-none">ExamFlow</p>
          <p className="mt-1 text-xs capitalize text-slate-500">{role} workspace</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {links.map(([to, label, Icon], i) => (
          <NavLink
            end={i === 0 || to.endsWith('/upcoming')}
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-100 p-4">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="text-xs capitalize text-slate-500">{role}</p>
      </div>
    </aside>
  );
}
