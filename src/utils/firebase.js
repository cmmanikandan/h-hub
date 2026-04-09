import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your_api_key",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your_auth_domain",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your_project_id",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your_storage_bucket",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "your_messaging_id",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "your_app_id",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);

if (typeof window !== 'undefined' && import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
    isSupported().then((supported) => {
        if (supported) {
            getAnalytics(app);
        }
    }).catch(() => {
        // Ignore analytics initialization failures to avoid blocking auth.
    });
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
