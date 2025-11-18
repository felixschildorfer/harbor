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
    const { name, xmlContent, anchorVersion } = req.body;
    
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
      anchorVersion: anchorVersion || 'v0.100.1', // Default to test version
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
    
    const currentVersion = anchorModel.currentVersionNumber || anchorModel.version;
    
    // Get all versions from history
    const historyVersions = anchorModel.versionHistory.map(v => ({
      ...v.toObject(),
      isCurrent: currentVersion === v.versionNumber,
      isLatest: v.versionNumber === anchorModel.version,
    }));
    
    // Add the latest version only if it's not already in history
    const latestInHistory = historyVersions.some(v => v.versionNumber === anchorModel.version);
    
    if (!latestInHistory) {
      historyVersions.unshift({
        versionNumber: anchorModel.version,
        xmlContent: anchorModel.xmlContent,
        message: 'Latest version',
        createdAt: anchorModel.updatedAt,
        isCurrent: currentVersion === anchorModel.version,
        isLatest: true,
      });
    }
    
    // Sort by version number descending
    historyVersions.sort((a, b) => b.versionNumber - a.versionNumber);
    
    res.json(historyVersions);
  } catch (error) {
    console.error('Error fetching version history:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST restore a previous version
router.post('/:id/restore/:versionNumber', async (req, res) => {
  try {
    const { versionNumber } = req.params;
    const parsedVersionNumber = parseInt(versionNumber);
    const anchorModel = await AnchorModel.findById(req.params.id);
    
    if (!anchorModel) {
      return res.status(404).json({ message: 'Anchor model not found' });
    }

    let versionToRestore = null;
    
    // Always look in history first, because that's where ALL versions are stored (including the latest if we saved it)
    versionToRestore = anchorModel.versionHistory.find(
      v => v.versionNumber === parsedVersionNumber
    );
    
    // If not in history and it's the latest version, load from xmlContent
    if (!versionToRestore && parsedVersionNumber === anchorModel.version) {
      versionToRestore = {
        xmlContent: anchorModel.xmlContent,
        versionNumber: anchorModel.version,
      };
    }

    if (!versionToRestore) {
      return res.status(404).json({ message: 'Version not found' });
    }

    const currentVersionNum = anchorModel.currentVersionNumber || anchorModel.version;
    
    // Before restoring, if we're switching away from the LATEST version, save it to history first
    // This ensures we don't lose the latest version when switching to an older one
    if (currentVersionNum === anchorModel.version && parsedVersionNumber !== anchorModel.version) {
      const latestAlreadySaved = anchorModel.versionHistory.some(v => v.versionNumber === anchorModel.version);
      
      if (!latestAlreadySaved) {
        // Save the latest version to history
        anchorModel.versionHistory.push({
          versionNumber: anchorModel.version,
          xmlContent: anchorModel.xmlContent,
          message: '',
          createdAt: new Date(),
        });
      }
    }

    // Now restore the version
    anchorModel.xmlContent = versionToRestore.xmlContent;
    anchorModel.currentVersionNumber = parsedVersionNumber;

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

    // Check if XML content has changed BEFORE updating
    const xmlHasChanged = xmlContent !== undefined && xmlContent.trim() !== anchorModel.xmlContent;

    // Store current version in history before updating
    if (xmlHasChanged) {
      anchorModel.versionHistory.push({
        versionNumber: anchorModel.version,
        xmlContent: anchorModel.xmlContent,
        message: message || '',
        createdAt: new Date(),
      });
      // Increment version when XML changes
      anchorModel.version += 1;
      anchorModel.currentVersionNumber = anchorModel.version;
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

