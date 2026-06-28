import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomInt } from 'node:crypto';
import { sendResetPasswordEmail } from '../config/mailer.js';

const RESET_CODE_EXPIRY_MINUTES = 15;

const validateResetCode = async (email, resetCode) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.resetPasswordCode || !user.resetCodeExpiresAt) {
    return { error: 'Invalid or expired reset code' };
  }

  if (user.resetCodeExpiresAt < new Date()) {
    await prisma.user.update({
      where: { email },
      data: { resetPasswordCode: null, resetCodeExpiresAt: null },
    });

    return { error: 'Invalid or expired reset code' };
  }

  const isValidResetCode = await bcrypt.compare(resetCode, user.resetPasswordCode);

  if (!isValidResetCode) {
    return { error: 'Invalid or expired reset code' };
  }

  return { user };
};

export const createUser = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword },
    });

    res.status(201).json({ status: 'success', data: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ status: 'error', message: 'Email already exists' });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      status: 'success',
      data: {
        user: { id: user.id, email: user.email, name: user.name },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ status: 'success', message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: { id: true, email: true, name: true, avatar: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.json({ status: 'success', data: user });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    res.json({ status: 'success', data: users });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    const successMessage = 'If the email is registered, a reset code has been sent';

    if (!user) {
      return res.json({ status: 'success', message: successMessage });
    }

    const resetCode = randomInt(100000, 1000000).toString();
    const hashedResetCode = await bcrypt.hash(resetCode, 10);
    const resetCodeExpiresAt = new Date(Date.now() + RESET_CODE_EXPIRY_MINUTES * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { resetPasswordCode: hashedResetCode, resetCodeExpiresAt },
    });

    await sendResetPasswordEmail(email, resetCode);

    res.json({ status: 'success', message: successMessage });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const verifyResetCode = async (req, res) => {
  try {
    const { email } = req.body;
    const resetCode = req.body.resetCode || req.body.code;

    if (!email || !resetCode) {
      return res.status(400).json({ status: 'error', message: 'Email and reset code are required' });
    }

    const { error } = await validateResetCode(email, resetCode);

    if (error) {
      return res.status(400).json({ status: 'error', message: error });
    }

    res.json({ status: 'success', message: 'Reset code verified' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const resetCode = req.body.resetCode || req.body.code;

    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ status: 'error', message: 'Email, reset code, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ status: 'error', message: 'Password must be at least 6 characters' });
    }

    const { error } = await validateResetCode(email, resetCode);

    if (error) {
      return res.status(400).json({ status: 'error', message: error });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetPasswordCode: null,
        resetCodeExpiresAt: null,
      },
    });

    res.json({ status: 'success', message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
