

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyApKrtzx7GD590t5m-8bnpeQiiPS6r9V-I",
  authDomain: "agristack-authentication.firebaseapp.com",
  projectId: "agristack-authentication",
  storageBucket: "agristack-authentication.firebasestorage.app",
  messagingSenderId: "566383296039",
  appId: "1:566383296039:web:de1257960a1916163a5802",
  measurementId: "G-JSJ4Q9JW02"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it for use in your components
export const auth = getAuth(app);