import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from './config/passport.js';
import {
    createUser,
    loginUser,
    deleteUser,
    getUserById,
    getUsers,
    forgotPassword,
    verifyResetCode,
    resetPassword
} from './controllers/userController.js';
import { googleCallback, githubCallback } from './controllers/authController.js';

// Konfigurasi dotenv agar bisa membaca file .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Endpoint Testing (Root Route)
app.get('/', (req, res) => {
    res.json({ message: "Welcome to Express.js Backend API" });
});

// User Routes
app.post('/api/user/create', createUser);
app.post('/api/login', loginUser);
app.get('/api/user', getUsers);
app.get('/api/user/:id', getUserById);
app.delete('/api/user/:id', deleteUser);
app.post('/api/forgot-password', forgotPassword);
app.post('/api/verify-reset-code', verifyResetCode);
app.post('/api/reset-password', resetPassword);

// === Auth Routes ===

// google 
app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
app.get('/api/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: false }), googleCallback);

// github
app.get('/api/auth/github', passport.authenticate('github', { scope: ['user:email', 'user:profile'], session: false }));
app.get('/api/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login', session: false }), githubCallback);


// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server is running smoothly on http://localhost:${PORT}`);
});
