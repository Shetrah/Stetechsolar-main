import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getIdTokenResult, type Auth, type User } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCcAjikwD5TzJZwJVzRSXis-mt0hL1LBqA',
  authDomain: 'stetech-solar.firebaseapp.com',
  projectId: 'stetech-solar',
  storageBucket: 'stetech-solar.firebasestorage.app',
  messagingSenderId: '1064926175452',
  appId: '1:1064926175452:web:4a735809a4b5db92a39419',
  measurementId: 'G-TLFT3L8TST',
};

const app = getApps().some((item) => item.name === 'stetech-solar-admin')
  ? getApp('stetech-solar-admin')
  : initializeApp(firebaseConfig, 'stetech-solar-admin');

export const firebaseAuth = getAuth(app);
export const firebaseDb = getFirestore(app);
export const firebaseStorage = getStorage(app);

const staffApp = getApps().some((item) => item.name === 'stetech-solar-staff')
  ? getApp('stetech-solar-staff')
  : initializeApp(firebaseConfig, 'stetech-solar-staff');

export const staffFirebaseAuth = getAuth(staffApp);
export const staffFirebaseDb = getFirestore(staffApp);

export async function isAdminFirebaseUser(user: User, db: Firestore = firebaseDb) {
  const token = await getIdTokenResult(user);
  if (token.claims.admin === true) return true;
  const userDocument = await getDoc(doc(db, 'users', user.uid));
  return userDocument.exists()
    && userDocument.data().role === 'admin';
}

export async function requireFirebaseAdmin() {
  const user = firebaseAuth.currentUser;
  if (!user || !(await isAdminFirebaseUser(user))) throw new Error('Sign in with an authorized Firebase admin account.');
  return user;
}

export async function isStaffFirebaseUser(user: User, db: Firestore = firebaseDb) {
  const userDocument = await getDoc(doc(db, 'users', user.uid));
  return userDocument.exists()
    && userDocument.data().role === 'staff'
    && userDocument.data().active === true;
}

export async function requireFirebaseStaffOrAdmin(auth: Auth = firebaseAuth, db: Firestore = firebaseDb, staffOnly = false) {
  const user = auth.currentUser;
  const authorized = user && (staffOnly
    ? await isStaffFirebaseUser(user, db)
    : await isAdminFirebaseUser(user, db) || await isStaffFirebaseUser(user, db));
  if (!user || !authorized) {
    throw new Error('Sign in with an active STETECH staff account.');
  }
  return user;
}