import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onMenu }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:h-20 md:px-6">
      <div className="flex items-center gap-3">
        <button className="rounded-lg p-2 text-slate-600 lg:hidden" onClick={onMenu} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <div>
          <p className="font-semibold">Welcome, {user?.name?.split(' ')[0]}</p>
          <p className="hidden text-xs text-slate-500 sm:block">Online examination workspace</p>
        </div>
      </div>
      <button
        onClick={async () => {
          await logout();
          navigate('/login');
        }}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
      >
        <LogOut size={16} />
        Sign out
      </button>
    </header>
  );
}
