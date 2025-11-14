import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import anchorModelRoutes from './routes/anchorModels.js';

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from client/public (for Anchor Editor and assets)
app.use(express.static(path.join(__dirname, '../client/public')));

// Routes
app.use('/api/anchor-models', anchorModelRoutes);

// Health check route
app.get('/api', (req, res) => {
  res.json({ message: 'API is running!' });
});

// Start server (even if MongoDB connection fails)
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/harbor')
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    console.warn('⚠️  Server is running but database operations will fail until MongoDB is connected.');
    console.warn('💡 To fix: Install MongoDB locally or use MongoDB Atlas and update MONGODB_URI in .env');
  });

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB error:', error);
});

