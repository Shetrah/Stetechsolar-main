import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { firebaseDb, requireFirebaseAdmin } from './firebase';
import { projects as initialProjects, type Project } from './projects';

const projectsCollection = collection(firebaseDb, 'projects');
let projects = initialProjects;

const normalizeProject = (data: Partial<Project> & { order?: number }): Project & { order?: number } => ({
  ...data,
  year: Number.isInteger(data.year) ? data.year! : null,
  images: Array.isArray(data.images) ? data.images : [],
} as Project & { order?: number });

export const getProjects = () => projects;

export function subscribeProjects(onChange: (items: Project[]) => void, onError?: (error: Error) => void) {
  return onSnapshot(projectsCollection, (snapshot) => {
    if (snapshot.empty) return;
    projects = snapshot.docs
      .map((item) => normalizeProject(item.data() as Partial<Project> & { order?: number }))
      .sort((first, second) => (first.order ?? 0) - (second.order ?? 0));
    onChange(projects);
  }, (error) => onError?.(error));
}

export async function ensureProjectsSeeded() {
  await requireFirebaseAdmin();
  const snapshot = await getDocs(projectsCollection);
  if (!snapshot.empty) return;
  const batch = writeBatch(firebaseDb);
  initialProjects.forEach((project, order) => {
    batch.set(doc(projectsCollection, project.slug), { ...project, order });
  });
  await batch.commit();
}

export async function saveProject(project: Project) {
  await requireFirebaseAdmin();
  const order = projects.findIndex((item) => item.slug === project.slug);
  await setDoc(doc(projectsCollection, project.slug), { ...project, order: order < 0 ? projects.length : order });
}

export async function removeProject(slug: string) {
  await requireFirebaseAdmin();
  await deleteDoc(doc(projectsCollection, slug));
}