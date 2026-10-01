import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { projects } from '../data/projects';
import { subscribeProjects } from '../data/projectStore';

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const [projectList, setProjectList] = useState(projects);
  const [activeImage, setActiveImage] = useState(0);
  useEffect(() => subscribeProjects(setProjectList), []);
  const project = projectList.find((item) => item.slug === slug);

  if (!project) {
    return (
      <main>
        <section className="site-container section-space">
          <p className="eyebrow">PROJECT NOT FOUND</p>
          <h1 className="text-3xl font-extrabold">We couldn’t find that project.</h1>
          <Link to="/projects" className="text-link mt-6"><ArrowLeft size={17} /> Back to projects</Link>
        </section>
      </main>
    );
  }

  const changeImage = (step: number) => {
    setActiveImage((current) => (current + step + project.images.length) % project.images.length);
  };

  return (
    <main>
      <section className="page-heading">
        <div className="site-container">
          <Link to="/projects" className="text-link mb-6"><ArrowLeft size={17} /> All projects</Link>
          <p className="eyebrow">{project.type} · {project.size} · {project.year ?? 'Year to be confirmed'}</p>
          <h1>{project.name}</h1>
          <p>{project.description}</p>
          <p className="mt-3 flex items-center gap-2 text-sm text-slate-600"><MapPin size={16} />{project.location}</p>
        </div>
      </section>
      <section className="site-container section-space">
        <div className="project-carousel" aria-label={`${project.name} project photos`}>
          <img src={project.images[activeImage]} alt={`${project.name}, photo ${activeImage + 1}`} />
          {project.images.length > 1 && <>
            <button type="button" className="project-carousel-control project-carousel-prev" onClick={() => changeImage(-1)} aria-label="Previous project photo"><ChevronLeft /></button>
            <button type="button" className="project-carousel-control project-carousel-next" onClick={() => changeImage(1)} aria-label="Next project photo"><ChevronRight /></button>
            <span className="project-carousel-count">{activeImage + 1} / {project.images.length}</span>
          </>}
        </div>
        {project.images.length > 1 && <div className="project-thumbnails" aria-label="Choose a project photo">
          {project.images.map((image, index) => <button type="button" key={image} onClick={() => setActiveImage(index)} aria-label={`Show photo ${index + 1}`} aria-pressed={activeImage === index}>
            <img src={image} alt="" loading="lazy" />
          </button>)}
        </div>}
      </section>
    </main>
  );
}