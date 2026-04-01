// 1. Import Firebase Authentication at the very top
import { auth } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

document.addEventListener('DOMContentLoaded', () => {
  // --- UI & Modal Logic (Unchanged) ---
  const loginModal = document.getElementById("loginModal");
  const registerModal = document.getElementById("registerModal");
  const loginBtn = document.getElementById("login-btn"); 
  const heroBtn = document.getElementById("hero-start-btn"); 
  const toRegisterLink = document.getElementById("toRegister"); 
  const toLoginLink = document.getElementById("toLogin"); 
  const closeBtns = document.querySelectorAll(".close-btn");

  const hideAllModals = () => {
    if (loginModal) loginModal.style.display = "none";
    if (registerModal) registerModal.style.display = "none";
    document.body.classList.remove("modal-open");
  };

  const openLogin = (e) => {
    e.preventDefault();
    hideAllModals();
    if (loginModal) {
      loginModal.style.display = "block";
      document.body.classList.add("modal-open");
    }
  };

  const openRegister = (e) => {
    e.preventDefault();
    hideAllModals();
    if (registerModal) {
      registerModal.style.display = "block";
      document.body.classList.add("modal-open");
    }
  };

  if (loginBtn) loginBtn.onclick = openLogin;
  if (heroBtn) heroBtn.onclick = openLogin;
  if (toLoginLink) toLoginLink.onclick = openLogin;
  if (toRegisterLink) toRegisterLink.onclick = openRegister;

  closeBtns.forEach(btn => {
    btn.onclick = hideAllModals;
  });

  window.onclick = (event) => {
    if (event.target === loginModal || event.target === registerModal) {
      hideAllModals();
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // --- NEW: Firebase Registration Logic ---
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.onsubmit = (e) => {
      e.preventDefault(); 
      
      const email = document.getElementById("regEmail").value;
      const pass = document.getElementById("regPassword").value;
      const confirmPass = document.getElementById("confirm-password").value;
      const selectedRole = document.querySelector('input[name="userRole"]:checked').value.toLowerCase();
      const fullName = document.getElementById("regName").value;

      if (!isValidEmail(email)) {
        alert("Please enter a valid email address.");
        return;
      }

      if (pass !== confirmPass) {
        alert("Passwords do not match. Please re-enter them.");
        return; 
      }

      // 1. Tell Firebase to create the account
      createUserWithEmailAndPassword(auth, email, pass)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const firebaseUid = user.uid;

          // 2. Send the new Firebase ID and user details to your MySQL Node.js server
          try {
            const response = await fetch('http://localhost:3000/api/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                firebase_uid: firebaseUid,
                full_name: fullName,
                email: email,
                role: selectedRole
              })
            });

            if (response.ok) {
              alert(`Registration successful! Logged in as a ${selectedRole}.`);
              hideAllModals();
              window.location.href = `${selectedRole}.html`; 
            } else {
              alert("Firebase account created, but failed to save to MySQL database.");
            }
          } catch (error) {
            console.error("Backend error:", error);
            alert("Could not connect to your Node.js server.");
          }
        })
        .catch((error) => {
          if (error.code === 'auth/email-already-in-use') {
            alert("This email is already registered.");
          } else {
            alert("Registration failed: " + error.message);
          }
        });
    };
  }

  // --- NEW: Firebase Login Logic ---
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.onsubmit = (e) => {
      e.preventDefault();
      
      const email = document.getElementById("email").value;
      const pass = document.getElementById("password").value; // Added grabbing the password

      if (!isValidEmail(email)) {
        alert("Please enter a valid email address.");
        return;
      }

      // 1. Tell Firebase to log the user in
      signInWithEmailAndPassword(auth, email, pass)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const firebaseUid = user.uid;

          // 2. Ask your Node.js server what role this user has in the MySQL database
          try {
            const response = await fetch(`http://localhost:3000/api/user/${firebaseUid}`);
            const userData = await response.json();

            if (response.ok) {
              hideAllModals();
              // Redirect them to their specific dashboard
              window.location.href = `${userData.role}.html`;
            } else {
              alert("User logged into Firebase, but profile not found in MySQL database.");
            }
          } catch (error) {
             console.error("Error fetching user role:", error);
             alert("Could not connect to your Node.js server to get user role.");
          }
        })
        .catch((error) => {
          alert("Login failed. Please check your email and password.");
        });
    };
  }
});