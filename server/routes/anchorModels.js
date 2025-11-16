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

// GET version history for a model (must come before /:id route)
router.get('/:id/history', async (req, res) => {
  try {
    const anchorModel = await AnchorModel.findById(req.params.id);
    if (!anchorModel) {
      return res.status(404).json({ message: 'Anchor model not found' });
    }
    
    const history = [
      {
        versionNumber: anchorModel.version,
        xmlContent: anchorModel.xmlContent,
        message: 'Current',
        createdAt: anchorModel.updatedAt,
        isCurrent: true,
      },
      ...anchorModel.versionHistory.sort((a, b) => b.versionNumber - a.versionNumber),
    ];
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching version history:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST restore a previous version
router.post('/:id/restore/:versionNumber', async (req, res) => {
  try {
    const { versionNumber } = req.params;
    const anchorModel = await AnchorModel.findById(req.params.id);
    
    if (!anchorModel) {
      return res.status(404).json({ message: 'Anchor model not found' });
    }

    let versionToRestore = null;
    
    // Check if it's the current version
    if (parseInt(versionNumber) === anchorModel.version) {
      versionToRestore = {
        xmlContent: anchorModel.xmlContent,
        versionNumber: anchorModel.version,
      };
    } else {
      // Find in history
      versionToRestore = anchorModel.versionHistory.find(
        v => v.versionNumber === parseInt(versionNumber)
      );
    }

    if (!versionToRestore) {
      return res.status(404).json({ message: 'Version not found' });
    }

    // Store current version in history
    anchorModel.versionHistory.push({
      versionNumber: anchorModel.version,
      xmlContent: anchorModel.xmlContent,
      message: `Reverted from v${versionNumber}`,
      createdAt: new Date(),
    });

    // Restore the version
    anchorModel.xmlContent = versionToRestore.xmlContent;
    anchorModel.version += 1;

    const restoredModel = await anchorModel.save();
    res.json({
      message: `Restored to version ${versionNumber}`,
      model: restoredModel,
    });
  } catch (error) {
    console.error('Error restoring version:', error);
    res.status(400).json({ message: error.message });
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
    const { name, xmlContent, message, description, tags } = req.body;
    
    const anchorModel = await AnchorModel.findById(req.params.id);
    if (!anchorModel) {
      return res.status(404).json({ message: 'Anchor model not found' });
    }

    // Store current version in history before updating
    if (xmlContent !== undefined && xmlContent.trim() !== anchorModel.xmlContent) {
      anchorModel.versionHistory.push({
        versionNumber: anchorModel.version,
        xmlContent: anchorModel.xmlContent,
        message: message || '',
        createdAt: new Date(),
      });
    }

    // Update fields if provided
    if (name !== undefined) {
      anchorModel.name = name.trim();
    }
    if (xmlContent !== undefined) {
      anchorModel.xmlContent = xmlContent.trim();
    }
    if (description !== undefined) {
      anchorModel.description = description.trim();
    }
    if (tags !== undefined && Array.isArray(tags)) {
      anchorModel.tags = tags.filter(t => t.trim()).map(t => t.trim());
    }
    
    // Increment version when XML changes
    if (xmlContent !== undefined && xmlContent.trim() !== anchorModel.xmlContent) {
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

