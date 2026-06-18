import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createUser, loginUser, deleteUser, getUsers } from './controllers/userController.js';

// Konfigurasi dotenv agar bisa membaca file .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Agar Express bisa membaca request body berformat JSON

// Endpoint Testing (Root Route)
app.get('/', (req, res) => {
    res.json({ message: "Welcome to Express.js Backend API" });
});

// User Routes
app.post('/api/user/create', createUser);
app.post('/api/login', loginUser);
app.get('/api/user', getUsers);
app.delete('/api/user/:id', deleteUser);

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server is running smoothly on http://localhost:${PORT}`);
});