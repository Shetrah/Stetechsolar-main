import { useEffect, useState } from 'react';
import { ArrowUpRight, BadgeCheck, CircleUserRound, KeyRound, Plus, UserRoundPlus, UserRoundX, X } from 'lucide-react';
import { createStaffAccount, setStaffActive, subscribeStaff, updateStaffInformation, type StaffProfile } from '../data/staffStore';

type StaffForm = { name: string; email: string; phone: string; position: string; password: string };
const emptyForm: StaffForm = { name: '', email: '', phone: '', position: '', password: '' };

export default function StaffManagement() {
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [editing, setEditing] = useState<StaffProfile | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<StaffForm>(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeStaff(setStaff, (reason) => setError(reason.message)), []);

  const openForm = (profile?: StaffProfile) => {
    setEditing(profile || null);
    setShowForm(true);
    setForm(profile ? { name: profile.name, email: profile.email, phone: profile.phone, position: profile.position, password: '' } : emptyForm);
    setError('');
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) await updateStaffInformation(editing, { name: form.name, phone: form.phone, position: form.position });
      else await createStaffAccount(form);
      setEditing(null);
      setShowForm(false);
      setForm(emptyForm);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to save staff account.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (profile: StaffProfile) => {
    try {
      await setStaffActive(profile, !profile.active);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to update staff access.');
    }
  };

  return <div className="space-y-6">
    <section className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold text-emerald-700">PEOPLE & ACCESS</p><h2 className="mt-1 text-2xl font-black">Staff portal access</h2><p className="mt-1 text-sm text-slate-500">Create cashier accounts, keep contact details current, and pause access when needed.</p><a href="/staff" className="mt-3 inline-flex items-center gap-1 text-sm font-extrabold text-emerald-800 hover:underline">Open staff portal <ArrowUpRight size={15} /></a></div><button onClick={() => openForm()} className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-emerald-700"><Plus className="mr-2 inline h-4 w-4" />Add staff member</button></section>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{staff.map((profile) => <article key={profile.uid} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-50 text-emerald-800"><CircleUserRound size={23} /></span><div><h3 className="font-extrabold">{profile.name}</h3><p className="text-xs text-slate-500">{profile.position || 'Sales staff'}</p></div></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${profile.active ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>{profile.active ? 'Active' : 'Paused'}</span></div>
      <dl className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm"><div className="flex justify-between gap-3"><dt className="text-slate-500">Email</dt><dd className="break-all text-right font-semibold">{profile.email}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-500">Phone</dt><dd className="font-semibold">{profile.phone || 'Not provided'}</dd></div></dl>
      <div className="mt-5 flex items-center justify-between"><button onClick={() => openForm(profile)} className="text-sm font-extrabold text-emerald-800 hover:underline">Edit details</button><button onClick={() => void toggleActive(profile)} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${profile.active ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}`}>{profile.active ? <UserRoundX size={15} /> : <BadgeCheck size={15} />}{profile.active ? 'Pause access' : 'Reactivate'}</button></div>
    </article>)}
    {!staff.length && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center md:col-span-2 xl:col-span-3"><UserRoundPlus className="mx-auto h-8 w-8 text-emerald-700" /><p className="mt-3 font-extrabold">No staff accounts yet</p><p className="mt-1 text-sm text-slate-500">Add a staff member to give them access to the cashier portal.</p></div>}</section>
    {showForm && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4"><form onSubmit={save} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="mb-6 flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-emerald-700">TEAM DIRECTORY</p><h2 className="mt-1 text-2xl font-black">{editing ? 'Edit staff details' : 'Add staff member'}</h2></div><button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-2 hover:bg-slate-100"><X size={20} /></button></div><StaffFields form={form} setForm={setForm} editing={Boolean(editing)} />{error && <p role="alert" className="mt-4 text-sm font-semibold text-red-700">{error}</p>}<button disabled={saving} className="mt-5 w-full rounded-lg bg-emerald-700 px-5 py-3 font-extrabold text-white disabled:opacity-50">{saving ? 'Saving…' : editing ? 'Save staff details' : 'Create account'}</button></form></div>}
  </div>;
}

function StaffFields({ form, setForm, editing }: { form: StaffForm; setForm: (form: StaffForm) => void; editing: boolean }) {
  const update = (key: keyof StaffForm, value: string) => setForm({ ...form, [key]: value });
  return <div className="space-y-4">
    <label className="block text-sm font-bold">Full name<input required autoComplete="name" value={form.name} onChange={(event) => update('name', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-3" /></label>
    <label className="block text-sm font-bold">Email address<input required type="email" autoComplete="email" disabled={editing} value={form.email} onChange={(event) => update('email', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-3 disabled:bg-slate-100" /></label>
    <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-bold">Phone<input autoComplete="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-3" /></label><label className="block text-sm font-bold">Position<input value={form.position} onChange={(event) => update('position', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-3" placeholder="Sales associate" /></label></div>
    {!editing && <label className="block text-sm font-bold">Temporary password<div className="relative"><KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input required minLength={6} type="password" autoComplete="new-password" value={form.password} onChange={(event) => update('password', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 py-3 pl-10 pr-3" /></div><span className="mt-1 block text-xs font-normal text-slate-500">At least 6 characters. Share this securely with the staff member.</span></label>}
  </div>;
}