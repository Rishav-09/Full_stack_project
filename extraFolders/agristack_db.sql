CREATE DATABASE IF NOT EXISTS agristack_db;
use agristack_db;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  firebase_uid VARCHAR(128) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  role ENUM('farmer', 'buyer', 'keeper', 'admin') NOT NULL,
  rating_avg DECIMAL(3,2) DEFAULT 0.00,
  rating_count INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS crop_listings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  farmer_id INT,
  crop_name VARCHAR(100) NOT NULL,
  description TEXT,
  quantity DECIMAL(10,2) NOT NULL,
  min_bid_price DECIMAL(12,2) NOT NULL,
  status ENUM('available', 'sold', 'expired') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS listing_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  listing_id INT,
  image_url VARCHAR(255) NOT NULL,
  FOREIGN KEY (listing_id) REFERENCES crop_listings(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bids (
  id INT PRIMARY KEY AUTO_INCREMENT,
  listing_id INT,
  buyer_id INT,
  amount DECIMAL(12,2) NOT NULL,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES crop_listings(id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  bid_id INT,
  buyer_id INT,
  farmer_id INT,
  final_amount DECIMAL(12,2) NOT NULL,
  payment_status ENUM('escrow', 'released', 'refunded') DEFAULT 'escrow',
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bid_id) REFERENCES bids(id) ON DELETE RESTRICT,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS storage_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  listing_id INT,
  keeper_id INT,
  entry_date DATE NOT NULL,
  exit_date DATE NULL,
  condition_notes TEXT,
  FOREIGN KEY (listing_id) REFERENCES crop_listings(id) ON DELETE CASCADE,
  FOREIGN KEY (keeper_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS announcements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admin_id INT,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  target_role ENUM('all', 'farmer', 'buyer', 'keeper') DEFAULT 'all',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  transaction_id INT,
  reviewer_id INT,
  reviewee_id INT,
  stars TINYINT CHECK (stars BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE
);

