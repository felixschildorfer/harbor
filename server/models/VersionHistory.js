import mongoose from 'mongoose';

const versionHistorySchema = new mongoose.Schema(
  {
    modelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AnchorModel',
      required: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    xmlContent: {
      type: String,
      required: true,
    },
    changelog: {
      type: String,
      trim: true,
      default: '',
    },
    author: {
      type: String,
      trim: true,
      default: 'Unknown',
    },
    changes: {
      type: {
        added: [String],
        removed: [String],
        modified: [String],
      },
      default: { added: [], removed: [], modified: [] },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one history entry per model version
versionHistorySchema.index({ modelId: 1, versionNumber: 1 }, { unique: true });

const VersionHistory = mongoose.model('VersionHistory', versionHistorySchema);

export default VersionHistory;
