import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from './config/passport.js';
import { createUser, loginUser, deleteUser, getUserById, getUsers } from './controllers/userController.js';
import { googleCallback } from './controllers/authController.js';

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

// Auth Routes
app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
app.get('/api/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: false }), googleCallback);

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server is running smoothly on http://localhost:${PORT}`);
});