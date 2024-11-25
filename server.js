import express from 'express';
import mongoose from 'mongoose';
import connectDatabase from './config/db.js';
import User from './models/User.js';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { check, validationResult } from 'express-validator';
import config from 'config';
import jwt from 'jsonwebtoken';

const app = express();

// To overcome CORS errors
app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
}));

app.use(express.json());
connectDatabase();

app.get('/', (req, res) => {
    res.send('HTTP GET request sent to root API endpoint');
});

app.post(
    '/api/users',
    [
        check('name', 'Please enter your name').not().isEmpty(),
        check('email', 'Please enter a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
            }

            user = new User({
                name,
                email,
                password,
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();

            const payload={
                user:{
                    id:user.id
                }
            };

            jwt.sign(
                payload,
                config.get('jwtSecret'),
                {expiresIn:'10hr'},
                (err,token)=>{
                    if(err) throw err;
                    res.json({token:token});
                }
            );

        } catch (error) {
            res.status(500).send('Server error');
        }
      
    }
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
});
