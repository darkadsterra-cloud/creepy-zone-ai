import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  type Auth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ??
    "AIzaSyDHZW_z82LEmDw3scs8fLPyoAbKNQnzQsA",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "creepy-zone.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "creepy-zone",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ??
    "creepy-zone.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "148398433939",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ??
    "1:148398433939:web:e1c68fff2ddb6ee4c00f66",
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-FYNTSZTJ12",
};

let app: FirebaseApp | undefined;

function getApp(): FirebaseApp {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  return getAuth(getApp());
}

export const auth = getFirebaseAuth();

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export async function googleLogin() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}
