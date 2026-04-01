// src/authGuard.js
import { auth } from './firebase.js';
import { onAuthStateChanged, signOut } from "firebase/auth";

// 1. The Route Guard
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // If no user is detected, redirect immediately to the home page
    window.location.replace("index.html");
  } else {
    // User is logged in. 
    console.log("Authenticated User UID:", user.uid);
    
    // (Optional for your graduation project): 
    // To make this extremely secure, you would fetch from your Node.js backend here
    // to verify if user.uid actually has the role matching the current HTML page.
  }
});

// 2. The Logout Functionality
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById("logout-btn");
  
  if (logoutBtn) {
    logoutBtn.onclick = (e) => {
      e.preventDefault();
      signOut(auth).then(() => {
        // Sign-out successful. 
        // The onAuthStateChanged listener above will automatically detect this 
        // and redirect them to index.html.
      }).catch((error) => {
        console.error("Error signing out:", error);
        alert("Failed to log out. Please try again.");
      });
    };
  }
});