import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpenCheck } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import Field, { Input, Button } from '../../components/forms/Field';
import { getErrorMessage } from '../../utils/errors';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await register(form);
      navigate(`/${user.role}`, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-slate-900 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <BookOpenCheck size={30} />
          <b className="text-2xl">ExamFlow</b>
        </div>
        <div className="max-w-lg">
          <h1 className="text-5xl font-bold leading-tight">Student registration only.</h1>
          <p className="mt-4 text-slate-300">Teacher and administrator accounts are created or authorized by an administrator.</p>
        </div>
        <p className="text-sm text-slate-400">Password must be at least 6 characters.</p>
      </section>
      <section className="flex items-center justify-center px-6 py-12">
        <form onSubmit={submit} className="w-full max-w-md space-y-4">
          <h2 className="text-3xl font-bold">Create student account</h2>
          {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          <Field label="Full name">
            <Input required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Email">
            <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Password">
            <Input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          <Field label="Confirm password">
            <Input type="password" required minLength={6} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
          </Field>
          <Button type="submit" loading={busy} className="w-full">
            Register
          </Button>
          <p className="text-center text-sm text-slate-500">
            Already registered?{' '}
            <Link className="font-semibold text-indigo-600" to="/login">
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}
