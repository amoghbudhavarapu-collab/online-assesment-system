import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpenCheck } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import Field, { Input, Button } from '../../components/forms/Field';
import { getErrorMessage } from '../../utils/errors';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await login(form.email, form.password);
      navigate(`/${user.role}`, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-indigo-700 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <BookOpenCheck size={30} />
          <b className="text-2xl">ExamFlow</b>
        </div>
        <div className="max-w-lg">
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-indigo-200">Secure assessments</p>
          <h1 className="text-5xl font-bold leading-tight">Sign in to your examination workspace.</h1>
        </div>
        <p className="text-sm text-indigo-200">Access tokens stay in memory. Sessions refresh with an HttpOnly cookie.</p>
      </section>
      <section className="flex items-center justify-center px-6 py-12">
        <form onSubmit={submit} className="w-full max-w-md space-y-4">
          <h2 className="text-3xl font-bold">Sign in</h2>
          <p className="text-sm text-slate-500">Use your registered email and password.</p>
          {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          <Field label="Email">
            <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Password">
            <Input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          <Button type="submit" loading={busy} className="w-full">
            Sign in
          </Button>
          <p className="text-center text-sm text-slate-500">
            New student?{' '}
            <Link className="font-semibold text-indigo-600" to="/register">
              Create an account
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}
