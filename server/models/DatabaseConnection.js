import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/encryption.js';

const databaseConnectionSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  sharedWith: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: [],
  },
  name: {
    type: String,
    required: [true, 'Connection name is required'],
    trim: true,
  },
  dbType: {
    type: String,
    required: [true, 'Database type is required'],
    enum: ['sqlserver', 'postgres'],
    default: 'sqlserver',
  },
  host: {
    type: String,
    required: [true, 'Host is required'],
    trim: true,
  },
  port: {
    type: Number,
    required: [true, 'Port is required'],
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  databaseName: {
    type: String,
    required: [true, 'Database name is required'],
    trim: true,
  },
  options: {
    type: Map,
    of: String,
    default: {},
  },
}, {
  timestamps: true,
});

// Encrypt password before saving
databaseConnectionSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    this.password = encrypt(this.password);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to get decrypted password
databaseConnectionSchema.methods.getDecryptedPassword = function() {
  try {
    return decrypt(this.password);
  } catch (error) {
    throw new Error('Failed to decrypt password');
  }
};

// Method to get connection config without sensitive data
databaseConnectionSchema.methods.getSafeConfig = function() {
  return {
    _id: this._id,
    ownerId: this.ownerId,
    name: this.name,
    dbType: this.dbType,
    host: this.host,
    port: this.port,
    username: this.username,
    databaseName: this.databaseName,
    sharedWith: this.sharedWith,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const DatabaseConnection = mongoose.model('DatabaseConnection', databaseConnectionSchema);

export default DatabaseConnection;
