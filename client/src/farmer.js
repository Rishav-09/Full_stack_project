// src/farmer.js
import { auth } from './firebase.js';
import { onAuthStateChanged } from "firebase/auth";

document.addEventListener('DOMContentLoaded', () => {
  const addCropForm = document.getElementById('addCropForm');
  let currentUserUid = null;

  // 1. Wait for Firebase to confirm who is logged in
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUserUid = user.uid;
      // Later, we will call a function here to fetch and display existing crops
      // fetchMyCrops(currentUserUid); 
      document.getElementById('listingsContainer').innerHTML = "<p style='color: #888;'>No active listings yet. Add one to get started!</p>";
    }
  });

  // 2. Handle the Form Submission
  if (addCropForm) {
    addCropForm.onsubmit = async (e) => {
      e.preventDefault();

      if (!currentUserUid) {
        alert("Authentication error. Please log in again.");
        return;
      }

      // Gather data from the form
      const cropData = {
        firebase_uid: currentUserUid, // We send this so the backend knows WHICH farmer owns it
        crop_name: document.getElementById('cropName').value,
        description: document.getElementById('cropDesc').value,
        quantity: document.getElementById('cropQty').value,
        min_bid_price: document.getElementById('minBid').value
      };

      try {
        // Send data to the Node.js backend
        const response = await fetch('http://localhost:3000/api/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cropData)
        });

        if (response.ok) {
          alert("Crop listed successfully!");
          addCropForm.reset(); // Clear the form
          // fetchMyCrops(currentUserUid); // Refresh the UI (We will build this next)
        } else {
          const errorData = await response.json();
          alert("Failed to list crop: " + (errorData.error || "Unknown error"));
        }
      } catch (error) {
        console.error("Error posting crop:", error);
        alert("Could not connect to the server.");
      }
    };
  }
});