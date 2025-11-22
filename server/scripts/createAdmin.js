import dotenv from 'dotenv';
import mongoose from 'mongoose';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import User from '../models/User.js';

dotenv.config();

const rl = readline.createInterface({ input, output });

const parseArg = (name) => {
  const prefixed = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefixed));
  if (match) {
    return match.slice(prefixed.length);
  }

  const idx = process.argv.indexOf(`--${name}`);
  if (idx !== -1 && process.argv[idx + 1]) {
    return process.argv[idx + 1];
  }

  return null;
};

const askIfMissing = async (value, prompt) => {
  if (value) return value.trim();
  const answer = await rl.question(`${prompt}: `);
  return answer.trim();
};

const ensureAdminRole = (roles = []) => {
  const normalized = roles.filter(Boolean);
  if (!normalized.includes('admin')) {
    normalized.push('admin');
  }
  return [...new Set(normalized)];
};

const main = async () => {
  try {
    const name = await askIfMissing(parseArg('name'), 'Admin name');
    const email = await askIfMissing(parseArg('email'), 'Admin email');
    const password = await askIfMissing(parseArg('password'), 'Admin password');
    const rolesArg = parseArg('roles');
    const roles = ensureAdminRole(rolesArg ? rolesArg.split(',').map((r) => r.trim()) : ['admin']);

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/harbor';
    await mongoose.connect(mongoUri);

    let user = await User.findOne({ email });

    if (user) {
      if (name) {
        user.name = name;
      }
      user.roles = ensureAdminRole([...user.roles, ...roles]);
      user.passwordHash = await User.hashPassword(password);
      user.tokenVersion += 1; // invalidate existing refresh tokens
      await user.save();
      console.log(`✅ Updated existing admin user: ${user.email}`);
    } else {
      const passwordHash = await User.hashPassword(password);
      user = await User.create({
        name,
        email,
        passwordHash,
        roles,
      });
      console.log(`✅ Created new admin user: ${user.email}`);
    }
  } catch (error) {
    console.error('❌ Failed to create admin user:', error.message);
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
};

main();
