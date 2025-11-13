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

