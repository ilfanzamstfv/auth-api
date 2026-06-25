import jwt from 'jsonwebtoken';

// Google callback
export const googleCallback = (req, res) => {
  try {
    const user = req.user;

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Github callback
export const githubCallback = (req, res) => {
  try {
    const user = req.user;

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};