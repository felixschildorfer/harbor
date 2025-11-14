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
    
    // xmlContent is required, name can be optional (generated timestamp if not provided)
    if (!xmlContent) {
      return res.status(400).json({ 
        message: 'XML content is required' 
      });
    }

    const modelName = name && name.trim() ? name.trim() : `Model ${new Date().toLocaleString()}`;

    const anchorModel = new AnchorModel({
      name: modelName,
      xmlContent: xmlContent.trim(),
      version: 1,
    });
    
    const savedModel = await anchorModel.save();
    res.status(201).json(savedModel);
  } catch (error) {
    console.error('Error creating anchor model:', error);
    const errorMessage = error.message || 'Failed to create anchor model';
    const errorDetails = error.stack || '';
    res.status(400).json({ 
      message: errorMessage,
      details: errorDetails 
    });
  }
});

// GET anchor model by ID
router.get('/:id', async (req, res) => {
  try {
    const anchorModel = await AnchorModel.findById(req.params.id);
    if (!anchorModel) {
      return res.status(404).json({ message: 'Anchor model not found' });
    }
    res.json(anchorModel);
  } catch (error) {
    console.error('Error fetching anchor model:', error);
    res.status(500).json({ message: error.message });
  }
});

// PUT update anchor model
router.put('/:id', async (req, res) => {
  try {
    const { name, xmlContent } = req.body;
    
    const anchorModel = await AnchorModel.findById(req.params.id);
    if (!anchorModel) {
      return res.status(404).json({ message: 'Anchor model not found' });
    }

    // Update fields if provided
    if (name !== undefined) {
      anchorModel.name = name.trim();
    }
    if (xmlContent !== undefined) {
      anchorModel.xmlContent = xmlContent.trim();
    }
    
    // Increment version when XML changes
    if (xmlContent !== undefined) {
      anchorModel.version += 1;
    }

    const updatedModel = await anchorModel.save();
    res.json(updatedModel);
  } catch (error) {
    console.error('Error updating anchor model:', error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE anchor model
router.delete('/:id', async (req, res) => {
  try {
    const anchorModel = await AnchorModel.findByIdAndDelete(req.params.id);
    if (!anchorModel) {
      return res.status(404).json({ message: 'Anchor model not found' });
    }
    res.json({ message: 'Anchor model deleted successfully' });
  } catch (error) {
    console.error('Error deleting anchor model:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;

