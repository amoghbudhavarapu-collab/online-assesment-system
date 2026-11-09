import { Link } from 'react-router-dom';
import { BookOpenCheck, ShieldCheck, Timer, BarChart3 } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <BookOpenCheck className="text-indigo-600" /> ExamFlow
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700">
            Sign in
          </Link>
          <Link to="/register" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
            Student register
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Online examination platform</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight text-slate-900 md:text-6xl">
          Conduct, schedule, and evaluate examinations with confidence.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-600">
          ExamFlow gives administrators, teachers, and students a secure workspace for question banks, timed assessments, automatic marking, and published results.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/register" className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white">
            Create a student account
          </Link>
          <Link to="/login" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold">
            Sign in to your dashboard
          </Link>
        </div>
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            [ShieldCheck, 'Role-based access', 'Separate workspaces for admins, teachers, and students with JWT sessions.'],
            [Timer, 'Server-enforced timing', 'Attempts use backend deadlines. Auto-submit when time expires.'],
            [BarChart3, 'Instant objective marking', 'MCQ, multiple select, true/false, and fill-in questions are scored automatically.']
          ].map(([Icon, title, copy]) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6">
              <Icon className="text-indigo-600" />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{copy}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
