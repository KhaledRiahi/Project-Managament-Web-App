// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDOYNgJyiF20QDhl_WGtPNksaDf1AuBzs8",
  authDomain: "base-f2884.firebaseapp.com",
  projectId: "base-f2884",
  storageBucket: "base-f2884.appspot.com",
  messagingSenderId: "338572317310",
  appId: "1:338572317310:web:78a21e5114b500ab83fe2f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Storage
const db = getFirestore(app);
const storage = getStorage(app);
const auth =getAuth(app);
// Export the app, db, and storage
export { app, db, storage,auth };
