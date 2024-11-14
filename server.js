import express from 'express';
import mongoose from 'mongoose';
import connectDatabase from './config/db.js';
import User from './models/Users.js';
import cors from 'cors';

const app = express();

//different from instructions, I was trying to overcome cors errors,
// turned out airplay from my mac was using port 5000
app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
  }));
  

  app.use(express.json({ extended: false }));
connectDatabase();

app.get('/', (req, res) => {
    res.send('HTTP GET request sent to root API endpoint');
});

app.post('/api/users', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const newUser = new User({ name, email, password });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
});
