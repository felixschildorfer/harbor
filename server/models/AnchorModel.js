import mongoose from 'mongoose';

// Version history sub-schema
const versionHistorySchema = new mongoose.Schema(
  {
    versionNumber: {
      type: Number,
      required: true,
    },
    xmlContent: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    message: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const anchorModelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    xmlContent: {
      type: String,
      required: true,
    },
    version: {
      type: Number,
      required: true,
      default: 1,
    },
    currentVersionNumber: {
      type: Number,
      default: 1,
    },
    versionHistory: [versionHistorySchema],
    description: {
      type: String,
      default: '',
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const AnchorModel = mongoose.model('AnchorModel', anchorModelSchema);

export default AnchorModel;

