import crypto from 'crypto';

const IV_LENGTH = 16;

const resolveEncryptionKey = () => {
  const rawKey = process.env.DB_ENCRYPTION_KEY?.trim();
  if (!rawKey) {
    throw new Error(
      'DB_ENCRYPTION_KEY is missing. Set a 32-byte (64 hex chars) key in server/.env before starting the server.'
    );
  }

  if (!/^[0-9a-fA-F]{64}$/.test(rawKey)) {
    throw new Error('DB_ENCRYPTION_KEY must be a 64-character hexadecimal string.');
  }

  return Buffer.from(rawKey, 'hex');
};

let keyBuffer;

const getKeyBuffer = () => {
  if (!keyBuffer) {
    keyBuffer = resolveEncryptionKey();
  }
  return keyBuffer;
};

export const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    getKeyBuffer(),
    iv
  );
  
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

export const decrypt = (text) => {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    getKeyBuffer(),
    iv
  );
  
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString();
};
