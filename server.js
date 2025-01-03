import express from 'express';
import mongoose from 'mongoose';
import connectDatabase from './config/db.js';
import User from './models/User.js';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { check, validationResult } from 'express-validator';
import config from 'config';
import jwt from 'jsonwebtoken';
import auth from './middleware/auth.js';
import Post from './models/Posts.js'

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
//authorize
app.get('/api/auth',auth,async (req,res) => {
    try {
        const user = await User.findById(req.user.id)
        res.status(200).json(user)
    } catch (error) {
        res.status(500).send('Unknown server error')
    }
})

app.post(
    '/api/users',
    [
      check('name', 'Please enter your name').not().isEmpty(),
      check('email', 'Please enter a valid email').isEmail(),
      check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      } else {
        const { name, email, password } = req.body;
        
        try {
          let user = await User.findOne({ email });
          if (user) {
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
          }
  
          // Create a new user
          user = new User({
            name,
            email,
            password
          });
  
          // Encrypt the password
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(password, salt);
  
          // Save to the db and return
          await user.save();
  
          // Generate and return a JWT token
          const payload = {
            user: {
              id: user._id
            }
          };
  
          const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
          return res.json({ token });
        } catch (error) {
          console.error(error);
          res.status(500).send('Server error');
        }
      }
    }
  );
  app.post(
    '/api/posts',
    auth,
    check('title', 'Title text is required').not().isEmpty(),
    check('body', 'Body text is required').not().isEmpty(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } else {
        const { title, body } = req.body;
        try {
          // Get the user who created the post
          const user = await User.findById(req.user.id);
  
          // Create a new post
          const post = new Post({
            user: user.id,
            title: title,
            body: body
          });
  
          // Save the post
          await post.save();
          res.json(post);
        } catch (error) {
          console.error(error);
          res.status(500).send('Server error');
        }
      }
    }
  );

  app.get('/api/posts', auth, async (req, res) => {
    try {
      const posts = await Post.find().sort({ date: -1 });
      res.json(posts);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });
  
  app.delete('/api/posts/:id', auth, async (req, res) => {
    try {
      // Find the post by its ID
      const post = await Post.findById(req.params.id);
  
      // Make sure the post was found
      if (!post) {
        return res.status(404).json({ msg: 'Post not found' });
      }
  
      // Make sure the user is authorized (i.e., the user created the post)
      if (post.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      }
  
      // Remove the post
      await post.remove();
  
      // Send a success response
      res.json({ msg: 'Post removed' });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });
  app.put('/api/posts/:id', auth, async (req, res) => {
    try {
      const { title, body } = req.body;
      const post = await Post.findById(req.params.id);
  
      if (!post) {
        return res.status(404).json({ msg: 'Post not found' });
      }
  
      if (post.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      }
  
      post.title = title || post.title;
      post.body = body || post.body;
  
      await post.save();
  
      res.json(post);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });
  


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
});
