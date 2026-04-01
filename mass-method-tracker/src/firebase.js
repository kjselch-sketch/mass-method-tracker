// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
