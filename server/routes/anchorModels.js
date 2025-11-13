import express from 'express';
import AnchorModel from '../models/AnchorModel.js';

const router = express.Router();

// GET all anchor models
router.get('/', async (req, res) => {
  try {
    const anchorModels = await AnchorModel.find().sort({ createdAt: -1 });
    res.json(anchorModels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create a new anchor model
router.post('/', async (req, res) => {
  try {
    const { name, xmlContent } = req.body;
    
    if (!name || !xmlContent) {
      return res.status(400).json({ 
        message: 'Name and XML content are required' 
      });
    }

    const anchorModel = new AnchorModel({
      name: name.trim(),
      xmlContent: xmlContent.trim(),
      version: 1,
    });
    
    const savedModel = await anchorModel.save();
    res.status(201).json(savedModel);
  } catch (error) {
    console.error('Error creating anchor model:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    
    let statusCode = 400;
    let errorMessage = error.message || 'Failed to create anchor model';
    
    // Handle specific Mongoose validation errors
    if (error.name === 'ValidationError') {
      errorMessage = `Validation Error: ${Object.values(error.errors).map(e => e.message).join(', ')}`;
    } else if (error.message && error.message.includes('exceeded')) {
      statusCode = 413;
      errorMessage = 'XML content is too large. Maximum size is approximately 5MB.';
    }
    
    res.status(statusCode).json({ 
      message: errorMessage,
      details: error.stack || '' 
    });
  }
});

export default router;

