// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCfTviUakNGmpQJduYK7Lq2GMXuAOr1ZEc",
  authDomain: "base-59e90.firebaseapp.com",
  databaseURL: "https://base-59e90-default-rtdb.firebaseio.com",
  projectId: "base-59e90",
  storageBucket: "base-59e90.appspot.com",
  messagingSenderId: "771480696850",
  appId: "1:771480696850:web:07f0237f24dec178ac00cb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Storage
const db = getFirestore(app);
const storage = getStorage(app);
const auth =getAuth(app);
// Export the app, db, and storage
export { app, db, storage,auth };
