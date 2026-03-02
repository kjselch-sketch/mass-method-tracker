import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ─────────────────────────────────────────────────────────────
//  STEP 1: Paste your Firebase config here (see README.md)
// ─────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyCiXW1Ium_ahCFMbfvRbiHCssIh_ixik9w",
  authDomain: "massmethod.firebaseapp.com",
  databaseURL: "https://massmethod-default-rtdb.firebaseio.com",
  projectId: "massmethod",
  storageBucket: "massmethod.firebasestorage.app",
  messagingSenderId: "550528083023",
  appId: "1:550528083023:web:d51f001b52bd50f1cbf63a",
  measurementId: "G-8Y56Y7EV1J"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
