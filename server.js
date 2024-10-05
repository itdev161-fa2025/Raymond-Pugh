import express from 'express';
import mongoose from 'mongoose';
import connectDatabase from './config/db.js';
import User from './models/Users.js';

const app = express();

app.use(express.json()); 

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
});
