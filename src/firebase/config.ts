import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Support custom firestoreDatabaseId if configured, or default database
const customDatabaseId = (firebaseConfig as any).firestoreDatabaseId;
export const db = customDatabaseId ? getFirestore(app, customDatabaseId) : getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);

// Google Workspace OAuth Scopes
export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets'
];

SCOPES.forEach((scope) => {
  googleProvider.addScope(scope);
});

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connection verified successfully.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline. Check network/config.');
    }
  }
}

// Kick off test on module load as mandated by skill
testConnection();
