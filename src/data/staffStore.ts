import { createUserWithEmailAndPassword, deleteUser, getAuth, signOut, updateProfile } from 'firebase/auth';
import { deleteApp, initializeApp } from 'firebase/app';
import { collection, doc, getDoc, onSnapshot, writeBatch } from 'firebase/firestore';
import { firebaseAuth, firebaseDb, requireFirebaseAdmin } from './firebase';
import type { Firestore } from 'firebase/firestore';

export interface StaffProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  active: boolean;
  createdAt: string;
}

export async function createStaffAccount(input: Omit<StaffProfile, 'uid' | 'active' | 'createdAt'> & { password: string }) {
  await requireFirebaseAdmin();
  const app = initializeApp(firebaseAuth.app.options, `stetech-staff-${crypto.randomUUID()}`);
  const secondaryAuth = getAuth(app);
  let newUser: Awaited<ReturnType<typeof createUserWithEmailAndPassword>>['user'] | undefined;
  try {
    const credential = await createUserWithEmailAndPassword(secondaryAuth, input.email.trim().toLowerCase(), input.password);
    newUser = credential.user;
    await updateProfile(newUser, { displayName: input.name.trim() });
    const createdAt = new Date().toISOString();
    const profile: StaffProfile = {
      uid: newUser.uid,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      position: input.position.trim(),
      active: true,
      createdAt,
    };
    const batch = writeBatch(firebaseDb);
    batch.set(doc(firebaseDb, 'users', newUser.uid), { role: 'staff', email: profile.email, name: profile.name, active: true, createdAt });
    batch.set(doc(firebaseDb, 'staff', newUser.uid), profile);
    await batch.commit();
    return profile;
  } catch (error) {
    if (newUser) await deleteUser(newUser).catch(() => undefined);
    throw error;
  } finally {
    await signOut(secondaryAuth).catch(() => undefined);
    await deleteApp(app).catch(() => undefined);
  }
}

export function subscribeStaff(onChange: (staff: StaffProfile[]) => void, onError: (error: Error) => void) {
  return onSnapshot(collection(firebaseDb, 'staff'), (snapshot) => {
    const staff = snapshot.docs.map((item) => item.data() as StaffProfile).sort((first, second) => first.name.localeCompare(second.name));
    onChange(staff);
  }, (error) => onError(error));
}

export async function setStaffActive(profile: StaffProfile, active: boolean) {
  await requireFirebaseAdmin();
  const batch = writeBatch(firebaseDb);
  batch.update(doc(firebaseDb, 'staff', profile.uid), { active });
  batch.update(doc(firebaseDb, 'users', profile.uid), { active });
  await batch.commit();
}

export async function getSignedInStaffName(uid: string, fallback: string, db: Firestore = firebaseDb) {
  const snapshot = await getDoc(doc(db, 'users', uid));
  return snapshot.exists() ? String(snapshot.data().name || fallback) : fallback;
}

export async function updateStaffInformation(profile: StaffProfile, changes: Pick<StaffProfile, 'name' | 'phone' | 'position'>) {
  await requireFirebaseAdmin();
  const name = changes.name.trim();
  const details = { ...changes, name, phone: changes.phone.trim(), position: changes.position.trim() };
  const batch = writeBatch(firebaseDb);
  batch.update(doc(firebaseDb, 'staff', profile.uid), details);
  batch.update(doc(firebaseDb, 'users', profile.uid), { name });
  await batch.commit();
}