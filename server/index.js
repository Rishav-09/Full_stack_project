// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const cors = require('cors');

// const app = express();
// app.use(cors()); // This allows your frontend to "call" the backend

// const server = http.createServer(app);

// // This creates the "io" variable that was missing
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173", // Your Vite frontend URL
//     methods: ["GET", "POST"]
//   }
// });

// io.on('connection', (socket) => {
//   // THIS is the line you are looking for!
//   console.log('A user connected! ID:', socket.id);

//   socket.on('disconnect', () => {
//     console.log('User disconnected');
//   });
// });

// const PORT = 3001;
// server.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });


import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Allows frontend to bypass CORS policy
app.use(express.json()); // Parses incoming JSON requests

// Create a MySQL Connection Pool
// A pool is better than a single connection because it handles multiple users efficiently
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the database connection on startup
pool.getConnection()
  .then(connection => {
    console.log('✅ Successfully connected to MySQL database: agristack_db');
    connection.release();
  })
  .catch(err => {
    console.error('❌ MySQL Connection Error:', err.message);
  });

// ==========================================
// API ROUTES
// ==========================================

// 1. Register a new user
app.post('/api/register', async (req, res) => {
  // Extract data sent from the frontend main.js
  const { firebase_uid, full_name, email, role } = req.body;

  try {
    // Insert into MySQL
    const [result] = await pool.query(
      'INSERT INTO users (firebase_uid, full_name, email, role) VALUES (?, ?, ?, ?)',
      [firebase_uid, full_name, email, role]
    );
    
    res.status(201).json({ 
      message: 'User registered successfully', 
      userId: result.insertId 
    });
  } catch (error) {
    console.error('Registration Error:', error);
    // Handle duplicate email error specifically
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Email already exists in database' });
    } else {
      res.status(500).json({ error: 'Database error during registration' });
    }
  }
});

// 2. Get user profile by Firebase UID (used during Login)
app.get('/api/user/:uid', async (req, res) => {
  const { uid } = req.params;

  try {
    // Query MySQL for the user
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE firebase_uid = ?', 
      [uid]
    );

    if (rows.length > 0) {
      // Send the user data back to the frontend (including their role)
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ error: 'User not found in database' });
    }
  } catch (error) {
    console.error('Login Fetch Error:', error);
    res.status(500).json({ error: 'Database error fetching user profile' });
  }
});


// ==========================================
// CROP LISTING ROUTES
// ==========================================

// 3. Create a new crop listing
app.post('/api/listings', async (req, res) => {
  const { firebase_uid, crop_name, description, quantity, min_bid_price } = req.body;

  try {
    // Step 1: Find the farmer's internal MySQL ID using their Firebase UID
    const [userRows] = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = ?', 
      [firebase_uid]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Farmer account not found in database.' });
    }

    const farmerId = userRows[0].id;

    // Step 2: Insert the new crop listing
    const [result] = await pool.query(
      'INSERT INTO crop_listings (farmer_id, crop_name, description, quantity, min_bid_price) VALUES (?, ?, ?, ?, ?)',
      [farmerId, crop_name, description, quantity, min_bid_price]
    );
    
    res.status(201).json({ 
      message: 'Crop listed successfully', 
      listingId: result.insertId 
    });
  } catch (error) {
    console.error('Error posting crop:', error);
    res.status(500).json({ error: 'Database error while saving the listing.' });
  }
});

// 4. Get all listings for a specific farmer
app.get('/api/listings/farmer/:uid', async (req, res) => {
  const { uid } = req.params;

  try {
    // Use a SQL JOIN to get the crops that belong to this specific Firebase UID
    const query = `
      SELECT c.* FROM crop_listings c
      JOIN users u ON c.farmer_id = u.id
      WHERE u.firebase_uid = ?
      ORDER BY c.created_at DESC
    `;
    
    const [rows] = await pool.query(query, [uid]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching crops:', error);
    res.status(500).json({ error: 'Database error while fetching listings.' });
  }
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
});