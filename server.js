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

app.post('/api/users', (req, res) => {
    console.log(req.body);
    res.status(200).send(req.body); 
});

app.listen(3000, () => console.log(`Express server running on port 3000`));
