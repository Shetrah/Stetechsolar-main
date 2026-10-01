import { useEffect, useState } from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { projects as initialProjects } from '../data/projects';
import { subscribeProjects } from '../data/projectStore';

export default function ProjectsPage() {
	const [projects, setProjects] = useState(initialProjects);
	useEffect(() => subscribeProjects(setProjects), []);

	return <main>
		<section className="page-heading"><div className="site-container"><p className="eyebrow">SOLAR IN ACTION</p><h1>Real places. Brighter days.</h1><p>Explore some of the homes, schools and communities we’ve helped power across Kenya.</p></div></section>
		<section className="site-container section-space"><div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">{projects.map((project) => <article key={project.slug} className="group overflow-hidden rounded-xl border border-slate-200 bg-white">
			<div className="overflow-hidden"><img src={project.images[0]} alt={project.name} loading="lazy" className="h-64 w-full object-cover transition duration-500 group-hover:scale-105" /></div>
			<div className="p-6"><p className="text-xs font-semibold text-emerald-700">{project.type} · {project.size} · {project.year ?? 'Year to be confirmed'}</p><h2 className="mt-3 text-xl font-bold">{project.name}</h2><p className="mt-3 flex items-center gap-2 text-sm text-slate-500"><MapPin size={16} />{project.location}</p><Link to={`/projects/${project.slug}`} className="text-link mt-6">View project <ArrowRight size={17} /></Link></div>
		</article>)}</div></section>
	</main>;
}
