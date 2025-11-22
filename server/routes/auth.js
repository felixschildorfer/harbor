import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import {
  generateTokens,
  rotateTokensFromRefresh,
  setRefreshCookie,
  clearRefreshCookie,
  requireAuth,
  getUserFromRefreshToken,
} from '../middleware/auth.js';

const router = express.Router();

const validateAuthRequest = (route) => {
  const rules = [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  ];

  if (route === 'register') {
    rules.push(body('name').optional().trim().isLength({ min: 1 }).withMessage('Name cannot be empty'));
  }

  return rules;
};

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
};

router.post('/register', validateAuthRequest('register'), async (req, res) => {
  if (handleValidation(req, res)) return;

  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name,
      email,
      passwordHash,
      roles: ['editor'],
    });

    const tokens = await generateTokens(user);
    setRefreshCookie(res, tokens.refreshToken);

    res.status(201).json({
      user: user.toSafeObject(),
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Failed to register user' });
  }
});

router.post('/login', validateAuthRequest('login'), async (req, res) => {
  if (handleValidation(req, res)) return;

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status === 'disabled') {
      return res.status(403).json({ message: 'Account is disabled' });
    }

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const tokens = await generateTokens(user);
    setRefreshCookie(res, tokens.refreshToken);

    res.json({
      user: user.toSafeObject(),
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Failed to login' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { user, accessToken, refreshToken } = await rotateTokensFromRefresh(req.cookies?.refreshToken);
    setRefreshCookie(res, refreshToken);
    res.json({ accessToken, user: user.toSafeObject() });
  } catch (error) {
    console.error('Refresh error:', error.message);
    res.status(401).json({ message: 'Unable to refresh session' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      const user = await getUserFromRefreshToken(refreshToken).catch(() => null);
      if (user) {
        await User.findByIdAndUpdate(user._id, { $inc: { tokenVersion: 1 } });
      }
    }
  } catch (error) {
    console.error('Logout error:', error.message);
  } finally {
    clearRefreshCookie(res);
    res.json({ message: 'Logged out' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user: user.toSafeObject() });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

export default router;
