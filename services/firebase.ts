import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBl6O6nFB_4v7m_jwnUtDao-I52fC-qnYo",
    authDomain: "emaapp-49274.firebaseapp.com",
    projectId: "emaapp-49274",
    storageBucket: "emaapp-49274.firebasestorage.app",
    messagingSenderId: "740136311902",
    appId: "1:740136311902:web:9f70c55928b97b9bd8e8cf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Explicitly set persistence to ensure mobile redirects work
import { setPersistence, browserLocalPersistence } from 'firebase/auth';
setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Persistence Error:", error);
});

// Enable Offline Persistence (The Magic for Smartphones)
try {
    enableIndexedDbPersistence(db).catch((err) => {
        if (err.code == 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one tab at a a time.
            console.warn("Persistence failed: Multiple tabs open.");
        } else if (err.code == 'unimplemented') {
            // The current browser does not support all of the features required to enable persistence
            console.warn("Persistence failed: Browser not supported.");
        }
    });
} catch (e) {
    console.log("Persistence setup error:", e);
}
