import { useEffect, useState } from 'react';
import { EmailAuthProvider, reauthenticateWithCredential, updateEmail, updatePassword, updateProfile, type User } from 'firebase/auth';
import { doc, getDoc, setDoc, type Firestore } from 'firebase/firestore';
import { Eye, EyeOff, X } from 'lucide-react';

type PortalRole = 'admin' | 'staff';

export default function PortalProfileModal({ db, user, role, onClose, onSaved }: {
  db: Firestore;
  user: User;
  role: PortalRole;
  onClose: () => void;
  onSaved?: (name: string) => void;
}) {
  const [name, setName] = useState(user.displayName || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void getDoc(doc(db, 'users', user.uid)).then(async (snapshot) => {
      const userData = snapshot.data() || {};
      let staffData: Record<string, unknown> = {};
      if (role === 'staff') {
        const staffSnapshot = await getDoc(doc(db, 'staff', user.uid));
        staffData = staffSnapshot.data() || {};
      }
      if (!active) return;
      setName(String(userData.name || staffData.name || user.displayName || ''));
      setEmail(String(userData.email || staffData.email || user.email || ''));
      setPhone(String(userData.phone || staffData.phone || ''));
      setPosition(String(userData.position || staffData.position || ''));
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : 'Could not load profile details.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [db, role, user]);

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const normalizedEmail = email.trim().toLowerCase();
    const changingEmail = normalizedEmail !== (user.email || '').toLowerCase();
    const changingPassword = newPassword.length > 0;
    if (changingPassword && newPassword !== confirmPassword) {
      setError('The new passwords do not match.');
      return;
    }
    if ((changingEmail || changingPassword) && !currentPassword) {
      setError('Enter your current password to change your sign-in details.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');
    try {
      if (changingEmail || changingPassword) {
        if (!user.email) throw new Error('This account does not have a password sign-in email.');
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
      }
      const normalizedName = name.trim();
      await updateProfile(user, { displayName: normalizedName });
      if (changingEmail) await updateEmail(user, normalizedEmail);
      if (changingPassword) await updatePassword(user, newPassword);

      const accountReference = doc(db, 'users', user.uid);
      const accountSnapshot = await getDoc(accountReference);
      await setDoc(accountReference, {
        ...(accountSnapshot.exists() ? {} : { role, active: true }),
        name: normalizedName,
        email: normalizedEmail,
        phone: phone.trim(),
        position: role === 'staff' ? position.trim() : '',
      }, { merge: true });
      if (role === 'staff') {
        await setDoc(doc(db, 'staff', user.uid), {
          name: normalizedName,
          email: normalizedEmail,
          phone: phone.trim(),
          position: position.trim(),
        }, { merge: true });
      }
      onSaved?.(normalizedName);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage('Your profile has been updated.');
    } catch (reason) {
      const code = reason && typeof reason === 'object' && 'code' in reason ? String(reason.code) : '';
      setError(code === 'auth/wrong-password' || code === 'auth/invalid-credential'
        ? 'Your current password is incorrect.'
        : reason instanceof Error ? reason.message : 'Unable to update your profile.');
    } finally {
      setSaving(false);
    }
  };

  return <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="profile-title" className="portal-profile-dialog max-h-[92vh] w-full max-w-xl overflow-y-auto">
      <header className="flex items-start justify-between gap-4 border-b border-white/40 px-6 py-5"><div><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-800">ACCOUNT SETTINGS</p><h2 id="profile-title" className="mt-1 text-2xl font-black text-slate-950">Your profile</h2><p className="mt-1 text-sm text-slate-600">Update your contact details and sign-in password.</p></div><button type="button" onClick={onClose} aria-label="Close profile settings" className="rounded-lg bg-white/70 p-2 text-slate-600 hover:bg-white"><X size={19} /></button></header>
      {loading ? <p className="p-8 text-center text-sm font-semibold text-slate-600">Loading profile…</p> : <form onSubmit={save} className="space-y-4 p-6">
        {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50/90 p-3 text-sm font-semibold text-rose-800">{error}</p>}
        {message && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50/90 p-3 text-sm font-semibold text-emerald-900">{message}</p>}
        <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Full name<input required value={name} onChange={(event) => setName(event.target.value)} className="portal-profile-input" autoComplete="name" /></label><label className="text-sm font-bold">Sign-in email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="portal-profile-input" autoComplete="email" /></label><label className="text-sm font-bold">Phone number<input value={phone} onChange={(event) => setPhone(event.target.value)} className="portal-profile-input" autoComplete="tel" /></label>{role === 'staff' && <label className="text-sm font-bold">Position<input value={position} onChange={(event) => setPosition(event.target.value)} className="portal-profile-input" /></label>}</div>
        <div className="border-t border-white/50 pt-4"><h3 className="font-extrabold">Change password</h3><p className="mt-1 text-xs text-slate-600">Leave these fields blank to keep your current password.</p></div>
        <label className="block text-sm font-bold">Current password<input type={showCurrentPassword ? 'text' : 'password'} autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="portal-profile-input" />{currentPassword && <button type="button" onClick={() => setShowCurrentPassword((visible) => !visible)} className="mt-1 text-xs font-bold text-emerald-800">{showCurrentPassword ? 'Hide password' : 'Show password'}</button>}</label>
        <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">New password<input type={showNewPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="portal-profile-input" />{newPassword && <button type="button" onClick={() => setShowNewPassword((visible) => !visible)} className="mt-1 text-xs font-bold text-emerald-800">{showNewPassword ? 'Hide password' : 'Show password'}</button>}</label><label className="text-sm font-bold">Confirm new password<input type={showNewPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="portal-profile-input" /></label></div>
        <div className="flex justify-end gap-3 border-t border-white/50 pt-4"><button type="button" onClick={onClose} className="rounded-lg border border-white/70 bg-white/60 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-white">Close</button><button disabled={saving} className="rounded-lg bg-emerald-800 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-emerald-900 disabled:opacity-50">{saving ? 'Saving…' : 'Save profile'}</button></div>
      </form>}
    </section>
  </div>;
}