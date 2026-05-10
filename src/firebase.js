import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCNAcwUQAGe8zomG9F6UVj5nZwl1yU2jBQ",
  authDomain: "teachermeet-975aa.firebaseapp.com",
  projectId: "teachermeet-975aa",
  storageBucket: "teachermeet-975aa.firebasestorage.app",
  messagingSenderId: "544085879920",
  appId: "1:544085879920:web:a3a20f254598ee999b98b5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);