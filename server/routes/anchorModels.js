import express from 'express';
import AnchorModel from '../models/AnchorModel.js';
import VersionHistory from '../models/VersionHistory.js';

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
    const { name, xmlContent, author = 'Unknown', description = '', tags = [], changelog = '' } = req.body;
    
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
      author: author.trim() || 'Unknown',
      description: description.trim() || '',
      tags: Array.isArray(tags) ? tags.filter(tag => tag.trim()) : [],
      version: 1,
    });
    
    const savedModel = await anchorModel.save();

    // Create initial version history entry
    const versionHistory = new VersionHistory({
      modelId: savedModel._id,
      versionNumber: 1,
      xmlContent: savedModel.xmlContent,
      author: author.trim() || 'Unknown',
      changelog: changelog.trim() || 'Initial version',
      changes: { added: [], removed: [], modified: [] },
    });

    await versionHistory.save();

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
    const { name, xmlContent, author, description, tags, changelog = '' } = req.body;
    
    const anchorModel = await AnchorModel.findById(req.params.id);
    if (!anchorModel) {
      return res.status(404).json({ message: 'Anchor model not found' });
    }

    const previousXmlContent = anchorModel.xmlContent;
    let xmlChanged = false;

    // Update fields if provided
    if (name !== undefined) {
      anchorModel.name = name.trim();
    }
    if (author !== undefined) {
      anchorModel.author = author.trim() || 'Unknown';
    }
    if (description !== undefined) {
      anchorModel.description = description.trim() || '';
    }
    if (tags !== undefined && Array.isArray(tags)) {
      anchorModel.tags = tags.filter(tag => tag.trim());
    }
    if (xmlContent !== undefined) {
      anchorModel.xmlContent = xmlContent.trim();
      xmlChanged = previousXmlContent !== xmlContent.trim();
    }
    
    // Increment version when XML changes
    if (xmlChanged) {
      anchorModel.version += 1;
    }

    const updatedModel = await anchorModel.save();

    // Create version history entry if XML changed
    if (xmlChanged) {
      const versionHistory = new VersionHistory({
        modelId: updatedModel._id,
        versionNumber: updatedModel.version,
        xmlContent: updatedModel.xmlContent,
        author: author ? author.trim() : anchorModel.author,
        changelog: changelog.trim() || `Updated to version ${updatedModel.version}`,
        changes: { added: [], removed: [], modified: [] },
      });
      await versionHistory.save();
    }

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

// GET version history for a model
router.get('/:id/versions', async (req, res) => {
  try {
    const versions = await VersionHistory.find({ modelId: req.params.id }).sort({ versionNumber: -1 });
    if (versions.length === 0) {
      return res.status(404).json({ message: 'No version history found for this model' });
    }
    res.json(versions);
  } catch (error) {
    console.error('Error fetching version history:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET specific version of a model
router.get('/:id/versions/:versionNum', async (req, res) => {
  try {
    const version = await VersionHistory.findOne({
      modelId: req.params.id,
      versionNumber: parseInt(req.params.versionNum),
    });
    if (!version) {
      return res.status(404).json({ message: 'Version not found' });
    }
    res.json(version);
  } catch (error) {
    console.error('Error fetching version:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST rollback to a specific version
router.post('/:id/rollback/:versionNum', async (req, res) => {
  try {
    const { changelog = 'Rollback' } = req.body;

    const anchorModel = await AnchorModel.findById(req.params.id);
    if (!anchorModel) {
      return res.status(404).json({ message: 'Anchor model not found' });
    }

    const versionToRestore = await VersionHistory.findOne({
      modelId: req.params.id,
      versionNumber: parseInt(req.params.versionNum),
    });

    if (!versionToRestore) {
      return res.status(404).json({ message: 'Version not found' });
    }

    // Update model with old XML content and increment version
    anchorModel.xmlContent = versionToRestore.xmlContent;
    anchorModel.version += 1;
    const updatedModel = await anchorModel.save();

    // Create new history entry for the rollback
    const newVersionHistory = new VersionHistory({
      modelId: updatedModel._id,
      versionNumber: updatedModel.version,
      xmlContent: updatedModel.xmlContent,
      author: versionToRestore.author,
      changelog: `${changelog} to version ${req.params.versionNum}`,
      changes: { added: [], removed: [], modified: [] },
    });
    await newVersionHistory.save();

    res.json(updatedModel);
  } catch (error) {
    console.error('Error rolling back model:', error);
    res.status(400).json({ message: error.message });
  }
});

export default router;

