import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { db, DEFAULT_DEMO_USER } from '../database/db';
import { config } from '../config';
import { User } from '../types';

export const register = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ success: false, message: 'Email, password, and name are required' });
      return;
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      res.status(409).json({ success: false, message: 'Email already registered' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser: User = {
      id: `usr_${crypto.randomUUID().slice(0, 8)}`,
      email,
      passwordHash,
      name,
      level: 1,
      xp: 0,
      streak: 1,
      avatarEmoji: '🏋️',
      themePreference: 'dark',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.saveUser(newUser);

    const signOptions: SignOptions = { expiresIn: config.jwtExpiresIn as any };
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, config.jwtSecret, signOptions);

    const { passwordHash: _, ...safeUser } = newUser;
    res.status(201).json({ success: true, token, user: safeUser });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const user = db.getUserByEmail(email);
    if (!user || !user.passwordHash) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const signOptions: SignOptions = { expiresIn: config.jwtExpiresIn as any };
    const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, signOptions);

    const { passwordHash: _, ...safeUser } = user;
    res.json({ success: true, token, user: safeUser });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const demoLogin = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = db.getUserById(DEFAULT_DEMO_USER.id) || DEFAULT_DEMO_USER;
  const signOptions: SignOptions = { expiresIn: config.jwtExpiresIn as any };
  const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, signOptions);
  const { passwordHash: _, ...safeUser } = user;
  res.json({ success: true, token, user: safeUser });
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = req.user;
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  const { passwordHash: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const { name, avatarEmoji, themePreference, level, xp, streak } = req.body;
    const updatedUser: User = {
      ...user,
      ...(name && { name }),
      ...(avatarEmoji && { avatarEmoji }),
      ...(themePreference && { themePreference }),
      ...(level !== undefined && { level }),
      ...(xp !== undefined && { xp }),
      ...(streak !== undefined && { streak }),
      updatedAt: new Date().toISOString(),
    };

    db.saveUser(updatedUser);
    const { passwordHash: _, ...safeUser } = updatedUser;
    res.json({ success: true, user: safeUser });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
