-- Create the database (run as superuser)
CREATE DATABASE weather_agent;

-- Connect to the database
\c weather_agent;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Run the schema
\i ../db/schema.sql

-- Create a test user for development
INSERT INTO users (email, name, google_id) 
VALUES ('test@example.com', 'Test User', 'google_test_id_123')
ON CONFLICT (email) DO NOTHING; 