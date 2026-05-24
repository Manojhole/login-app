-- ============================================================
--  MySQL Init Script  —  runs once on first container start
-- ============================================================

CREATE DATABASE IF NOT EXISTS loginapp;
USE loginapp;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    username   VARCHAR(80)  NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,          -- bcrypt hash
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Seed user: username=manoj  password=admin
--   bcrypt hash of "admin" with 12 rounds
INSERT IGNORE INTO users (username, password)
VALUES (
    'manoj',
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'
);

-- You can add more seed users here
-- INSERT IGNORE INTO users (username, password) VALUES ('alice', '<bcrypt_hash>');
