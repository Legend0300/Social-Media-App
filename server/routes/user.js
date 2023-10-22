const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const authMiddleware = require('../middleware/auth');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken');


// Create a new user
router.post('/register', async (req, res) => {
    console.log('Registering new user:', req.body);
    const newUser = new User({
      name: req.body.name,
      bio: req.body.bio,
      password: req.body.password,
      email: req.body.email
    });
  
    try {
      const savedUser = await newUser.save();
      console.log('New user created:', savedUser);
      res.status(201).json(savedUser);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error creating user');
    }
  });


router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find the user by email in your database
      const user = await User.findOne({ email });
  
      // If the user doesn't exist, return an error
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
  
      // Compare the provided password with the hashed password in the database
        const isPasswordValid = (password == user.password);  
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
  
      // Generate a JWT token
      const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET , {
        expiresIn: '1h', // Token expiration time (adjust as needed)
      });
  
      res.status(200).json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


  router.post('/logout', (req, res) => {
    // Clear the JWT token from the client-side storage
    // (e.g. local storage or cookies)
    // ...
  
    res.status(200).json({ message: 'Logout successful' });
  });
  

// Follow a user
router.post('/users/:id/follow', async (req, res) => {
    const userId = req.params.id;
    const followerId = req.user._id;

    try {
        // Find the user to follow
        const userToFollow = await User.findById(userId);

        // If the user doesn't exist, return an error
        if (!userToFollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the current user is already following the user
        const isAlreadyFollowing = userToFollow.followers.some(follower => follower.user.equals(followerId));
        if (isAlreadyFollowing) {
            return res.status(400).json({ message: 'You are already following this user' });
        }

        // Add the current user to the user's followers list
        userToFollow.followers.push({ user: followerId });
        await userToFollow.save();

        // Add the user to the current user's following list
        const currentUser = await User.findById(followerId);
        currentUser.following.push({ user: userId });
        await currentUser.save();

        res.status(200).json({ message: 'User followed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error following user');
    }
});

// Unfollow a user
router.post('/users/:id/unfollow', async (req, res) => {
    const userId = req.params.id;
    const followerId = req.user._id;

    try {
        // Find the user to unfollow
        const userToUnfollow = await User.findById(userId);

        // If the user doesn't exist, return an error
        if (!userToUnfollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the current user is already following the user
        const isAlreadyFollowing = userToUnfollow.followers.some(follower => follower.user.equals(followerId));
        if (!isAlreadyFollowing) {
            return res.status(400).json({ message: 'You are not following this user' });
        }

        // Remove the current user from the user's followers list
        userToUnfollow.followers = userToUnfollow.followers.filter(follower => !follower.user.equals(followerId));
        await userToUnfollow.save();

        // Remove the user from the current user's following list
        const currentUser = await User.findById(followerId);
        currentUser.following = currentUser.following.filter(follow => !follow.user.equals(userId));
        await currentUser.save();

        res.status(200).json({ message: 'User unfollowed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error unfollowing user');
    }
});

// Read all users
router.get('/users', (req, res) => {
    User.find({}, (err, users) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error getting users');
        } else {
            console.log('All users:', users);
            res.status(200).json(users);
        }
    });
});

// Read a single user by ID
router.get('/users/:id', (req, res) => {
    const userId = req.params.id;

    User.findById(userId, (err, user) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error getting user');
        } else if (!user) {
            res.status(404).send('User not found');
        } else {
            console.log('User found:', user);
            res.status(200).json(user);
        }
    });
});

// Update a user by ID
router.put('/users/:id', (req, res) => {
    const userIdToUpdate = req.params.id;

    User.findByIdAndUpdate(userIdToUpdate, { name: req.body.name, bio: req.body.bio }, { new: true }, (err, user) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error updating user');
        } else if (!user) {
            res.status(404).send('User not found');
        } else {
            console.log('User updated:', user);
            res.status(200).json(user);
        }
    });
});

// Delete a user by ID
router.delete('/users/:id', (req, res) => {
    const userIdToDelete = req.params.id;

    User.findByIdAndDelete(userIdToDelete, (err, user) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error deleting user');
        } else if (!user) {
            res.status(404).send('User not found');
        } else {
            console.log('User deleted:', user);
            res.status(200).json(user);
        }
    });
});

module.exports = router;