import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/AuthProvider';
import * as userApi from '../../lib/api/users';
import * as authApi from '../../lib/api/auth';
import { getErrorMessage } from '../../utils/errors';
import { formatDateTime } from '../../utils/datetime';
import PageHeader from '../../components/common/PageHeader';
import Field, { Input, Button } from '../../components/forms/Field';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [changing, setChanging] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await userApi.updateOwnProfile({ name });
      setUser(updated);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not update profile'));
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setChanging(true);
    try {
      await authApi.changePassword(passwords);
      setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      toast.success('Password changed');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not change password'));
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Manage your account details and password." />
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={saveProfile} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold">Account</h2>
          <Field label="Full name">
            <Input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
          </Field>
          <Field label="Email">
            <Input value={user?.email || ''} disabled />
          </Field>
          <Field label="Role">
            <Input value={user?.role || ''} disabled className="capitalize" />
          </Field>
          <p className="text-xs text-slate-500">Member since {formatDateTime(user?.createdAt)}</p>
          <Button type="submit" loading={saving}>
            Save profile
          </Button>
        </form>
        <form onSubmit={savePassword} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold">Change password</h2>
          <Field label="Current password">
            <Input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required />
          </Field>
          <Field label="New password">
            <Input type="password" minLength={6} value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required />
          </Field>
          <Field label="Confirm new password">
            <Input type="password" minLength={6} value={passwords.confirmNewPassword} onChange={(e) => setPasswords({ ...passwords, confirmNewPassword: e.target.value })} required />
          </Field>
          <Button type="submit" loading={changing}>
            Update password
          </Button>
        </form>
      </div>
    </div>
  );
}
