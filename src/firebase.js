import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCCCOoEZRqzecvl-Jh0VCihmgw_K6EzTo4",
  authDomain: "scottle.firebaseapp.com",
  projectId: "scottle",
  storageBucket: "scottle.firebasestorage.app",
  messagingSenderId: "288383167390",
  appId: "1:288383167390:web:1a4742976f0d2afafb448f",
  measurementId: "G-9KPYVQR6CV"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);