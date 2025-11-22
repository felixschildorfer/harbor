import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev-access-secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';
const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || '15m';
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || '7d';
const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

const signAccessToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      roles: user.roles,
      email: user.email,
    },
    ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );

const signRefreshToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      tokenVersion: user.tokenVersion,
    },
    REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_TTL }
  );

const resolveUserFromRefreshToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error('Refresh token missing');
  }

  const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
  const user = await User.findById(decoded.sub);

  if (!user || user.status === 'disabled') {
    throw new Error('User not found or inactive');
  }

  if (decoded.tokenVersion !== user.tokenVersion) {
    throw new Error('Refresh token revoked');
  }

  return user;
};

export const generateTokens = async (user) => {
  if (!user) {
    throw new Error('User context required to generate tokens');
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  return { user, accessToken, refreshToken };
};

export const rotateTokensFromRefresh = async (refreshToken) => {
  const user = await resolveUserFromRefreshToken(refreshToken);
  return generateTokens(user);
};

export const getUserFromRefreshToken = async (refreshToken) => resolveUserFromRefreshToken(refreshToken);

const extractAccessToken = (req) => {
  const header = req.header('Authorization') || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.replace('Bearer ', '').trim();
};

export const requireAuth = async (req, res, next) => {
  try {
    const token = extractAccessToken(req);

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, ACCESS_SECRET);
    const user = await User.findById(decoded.sub);

    if (!user || user.status === 'disabled') {
      return res.status(401).json({ message: 'User unavailable' });
    }

    req.user = {
      id: user._id.toString(),
      roles: user.roles,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ message: 'Authentication required' });
  }
};

export const requireRole = (roles = []) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const hasRole = req.user.roles?.includes('admin') || roles.some((role) => req.user.roles?.includes(role));

  if (!hasRole) {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }

  next();
};

export const setRefreshCookie = (res, token) => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: REFRESH_COOKIE_MAX_AGE,
    path: '/',
  });
};

export const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/',
  });
};
