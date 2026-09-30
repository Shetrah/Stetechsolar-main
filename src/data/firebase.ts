import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getIdTokenResult, type User } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
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

export async function isAdminFirebaseUser(user: User) {
  const token = await getIdTokenResult(user);
  if (token.claims.admin === true) return true;
  const userDocument = await getDoc(doc(firebaseDb, 'users', user.uid));
  return userDocument.exists()
    && userDocument.data().role === 'admin'
    && String(userDocument.data().email || '').toLowerCase() === user.email?.toLowerCase();
}

export async function requireFirebaseAdmin() {
  const user = firebaseAuth.currentUser;
  if (!user || !(await isAdminFirebaseUser(user))) throw new Error('Sign in with an authorized Firebase admin account.');
  return user;
}