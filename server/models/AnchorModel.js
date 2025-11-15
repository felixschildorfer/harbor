import mongoose from 'mongoose';

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
    description: {
      type: String,
      trim: true,
      default: '',
    },
    author: {
      type: String,
      trim: true,
      default: 'Unknown',
    },
    tags: {
      type: [String],
      default: [],
    },
    version: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const AnchorModel = mongoose.model('AnchorModel', anchorModelSchema);

export default AnchorModel;

