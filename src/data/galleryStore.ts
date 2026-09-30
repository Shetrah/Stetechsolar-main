import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { firebaseDb, firebaseStorage, requireFirebaseAdmin } from './firebase';
import { seedGallery, type GalleryImage } from './gallery';

const galleryCollection = 'gallery';

export async function listGallery(admin = false): Promise<GalleryImage[]> {
  if (admin) await requireFirebaseAdmin();
  const reference = collection(firebaseDb, galleryCollection);
  let snapshot;
  if (admin) {
    snapshot = await getDocs(reference);
    const existingIds = new Set(snapshot.docs.map((item) => item.id));
    const missingSeeds = seedGallery.filter((image) => !existingIds.has(image.id));
    if (missingSeeds.length) {
      const batch = writeBatch(firebaseDb);
      missingSeeds.forEach((image) => batch.set(doc(firebaseDb, galleryCollection, image.id), image));
      await batch.commit();
      snapshot = await getDocs(reference);
    }
    snapshot = await getDocs(query(reference, orderBy('order', 'asc')));
    await setDoc(doc(firebaseDb, 'gallerySettings', 'seedsInitialized'), { initialized: true });
  } else {
    snapshot = await getDocs(query(reference, where('published', '==', true)));
    if (snapshot.empty) {
      const initialized = await getDoc(doc(firebaseDb, 'gallerySettings', 'seedsInitialized'));
      if (!initialized.exists()) return seedGallery;
    }
  }
  const records = new Map(admin || snapshot.empty ? seedGallery.map((image) => [image.id, image]) : []);
  snapshot.docs.forEach((item) => records.set(item.id, item.data() as GalleryImage));
  return [...records.values()]
    .filter((image) => admin || image.published)
    .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
}

export async function saveGalleryImage(file: File, details: Pick<GalleryImage, 'title' | 'category' | 'location' | 'published'>) {
  await requireFirebaseAdmin();
  const id = crypto.randomUUID();
  const storagePath = `gallery/images/${id}.webp`;
  const existingImages = await listGallery(true);
  const imageRef = ref(firebaseStorage, storagePath);
  const result = await uploadBytes(imageRef, file, { contentType: file.type || 'image/webp' });
  const image: GalleryImage = {
    id,
    src: await getDownloadURL(result.ref),
    ...details,
    order: Math.max(-1, ...existingImages.map((item) => item.order)) + 1,
    storagePath,
  };
  try {
    await setDoc(doc(firebaseDb, galleryCollection, id), image);
  } catch (error) {
    await deleteObject(imageRef).catch(() => undefined);
    throw error;
  }
  return image;
}

export async function updateGalleryImage(image: GalleryImage) {
  await requireFirebaseAdmin();
  const { id, ...record } = image;
  await setDoc(doc(firebaseDb, galleryCollection, id), record, { merge: true });
}

export async function deleteGalleryImage(image: GalleryImage) {
  await requireFirebaseAdmin();
  if (seedGallery.some((seed) => seed.id === image.id)) {
    await setDoc(doc(firebaseDb, galleryCollection, image.id), { ...image, published: false });
    return;
  }
  await deleteDoc(doc(firebaseDb, galleryCollection, image.id));
  if (image.storagePath) await deleteObject(ref(firebaseStorage, image.storagePath)).catch(() => undefined);
}