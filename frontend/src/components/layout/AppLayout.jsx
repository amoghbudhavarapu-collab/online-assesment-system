import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AppLayout() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 lg:pl-64">
      <Sidebar role={user.role} name={user.name} />
      {open && (
        <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="h-full w-64 bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <p className="mb-4 font-bold">ExamFlow</p>
            <NavLink to={`/${user.role}`} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm">
              Close menu and continue
            </NavLink>
          </div>
        </div>
      )}
      <Navbar onMenu={() => setOpen(true)} />
      <main className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
