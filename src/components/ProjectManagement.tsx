import { useEffect, useState } from 'react';
import { Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import { ensureProjectsSeeded, getProjects, removeProject, saveProject, subscribeProjects } from '../data/projectStore';
import type { Project } from '../data/projects';

const blankProject = (): Project => ({ slug: '', name: '', location: '', size: '', type: '', description: '', year: null, images: [] });

export default function ProjectManagement() {
  const [projects, setProjects] = useState(getProjects());
  const [editing, setEditing] = useState<Project | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let unsubscribe = () => undefined;
    void ensureProjectsSeeded()
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Could not load projects.'))
      .finally(() => { unsubscribe = subscribeProjects(setProjects); });
    return () => unsubscribe();
  }, []);

  const editProject = (project?: Project) => {
    setEditing(project ? { ...project, images: [...project.images] } : blankProject());
    setError('');
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing || saving) return;
    setSaving(true);
    setError('');
    const normalized = {
      ...editing,
      slug: editing.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, ''),
      images: editing.images.filter(Boolean),
    };
    try {
      await saveProject(normalized);
      setEditing(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save this project.');
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async (project: Project) => {
    if (!window.confirm(`Remove ${project.name} from the project list?`)) return;
    try {
      await removeProject(project.slug);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not remove this project.');
    }
  };

  return <div className="space-y-6">
    <section className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-sm font-bold text-emerald-700">PORTFOLIO</p><h2 className="mt-1 text-2xl font-black">Projects</h2><p className="mt-1 text-sm text-slate-500">Each project has a verified installation year and its own photo carousel.</p></div>
      <button onClick={() => editProject()} className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-emerald-700"><Plus className="mr-2 inline h-4 w-4" />Add project</button>
    </section>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4">Project</th><th>Location</th><th>Year</th><th>Photos</th><th className="pr-5 text-right">Edit</th></tr></thead><tbody className="divide-y divide-slate-100">
        {projects.map((project) => <tr key={project.slug}><td className="px-5 py-4"><p className="font-extrabold">{project.name}</p><p className="mt-1 text-xs text-slate-500">{project.type} · {project.size}</p></td><td>{project.location}</td><td>{project.year ?? <span className="font-semibold text-amber-700">Year needed</span>}</td><td>{project.images.length}</td><td className="pr-5 text-right"><button aria-label={`Edit ${project.name}`} onClick={() => editProject(project)} className="rounded-lg p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"><Edit3 size={17} /></button><button aria-label={`Delete ${project.name}`} onClick={() => void deleteProject(project)} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"><Trash2 size={17} /></button></td></tr>)}
      </tbody></table></div>
    </section>
    {editing && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4"><form onSubmit={save} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
      <div className="mb-6 flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-emerald-700">PROJECT DETAILS</p><h2 className="mt-1 text-2xl font-black">{editing.name ? 'Edit project' : 'New project'}</h2></div><button type="button" aria-label="Close" onClick={() => setEditing(null)} className="rounded-lg p-2 hover:bg-slate-100"><X size={20} /></button></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold">Project name<input required value={editing.name} onChange={(event) => { const name = event.target.value; setEditing({ ...editing, name, slug: editing.slug || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') }); }} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-3" /></label>
        <label className="text-sm font-bold">Project year<input required type="number" min="2000" max={new Date().getFullYear()} value={editing.year ?? ''} onChange={(event) => setEditing({ ...editing, year: Number(event.target.value) || null })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-3" /></label>
        <label className="text-sm font-bold">Location<input required value={editing.location} onChange={(event) => setEditing({ ...editing, location: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-3" /></label>
        <label className="text-sm font-bold">System / project size<input required value={editing.size} onChange={(event) => setEditing({ ...editing, size: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-3" /></label>
        <label className="text-sm font-bold">Project category<input required value={editing.type} onChange={(event) => setEditing({ ...editing, type: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-3" /></label>
        <label className="text-sm font-bold sm:col-span-2">Short description<textarea required rows={3} value={editing.description} onChange={(event) => setEditing({ ...editing, description: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-3" /></label>
        <label className="text-sm font-bold sm:col-span-2">Photo paths, one per line<textarea required rows={4} value={editing.images.join('\n')} onChange={(event) => setEditing({ ...editing, images: event.target.value.split(/[\n,]/).map((path) => path.trim()).filter(Boolean) })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-3 font-mono text-xs" placeholder="/projects/project-photo-1.jpg" /></label>
      </div>
      {error && <p role="alert" className="mt-4 text-sm font-semibold text-red-700">{error}</p>}
      <button disabled={saving} className="mt-5 rounded-lg bg-emerald-700 px-5 py-3 font-extrabold text-white hover:bg-emerald-800 disabled:opacity-50"><Save className="mr-2 inline h-4 w-4" />{saving ? 'Saving…' : 'Save project'}</button>
    </form></div>}
  </div>;
}