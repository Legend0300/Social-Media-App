const express = require('express');
const router = express.Router();
const Post = require('../models/postModel');
const jwt = require('jsonwebtoken');


// Create a new post
router.post('/posts', (req, res) => {
    const newPost = new Post({
        text: req.body.text,
        user: req.body.user
    });

    newPost.save((err, post) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error creating post');
        } else {
            console.log('New post created:', post);
            res.status(201).json(post);
        }
    });
});

// Read all posts from the users that the current user is following
router.get('/posts_foruser', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, PROCESS.env.JWT_SECRET);
    const userId = decodedToken.userId;
  
    User.findById(userId, (err, user) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error getting user');
      } else if (!user) {
        res.status(404).send('User not found');
      } else {
        const followingIds = user.following.map(follow => follow.user);
  
        Post.find({ user: { $in: [userId, ...followingIds] } }, (err, posts) => {
          if (err) {
            console.error(err);
            res.status(500).send('Error getting posts');
          } else {
            console.log('All posts:', posts);
            res.status(200).json(posts);
          }
        });
      }
    });
});

// Read all posts sorted by likes
router.get('/posts', (req, res) => {
    Post.find({}).sort({ likes: -1 }).exec((err, posts) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error getting posts');
      } else {
        console.log('All posts:', posts);
        res.status(200).json(posts);
      }
    });
});


// Read a single post by ID
router.get('/posts/:id', (req, res) => {
    const postId = req.params.id;

    Post.findById(postId, (err, post) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error getting post');
        } else if (!post) {
            res.status(404).send('Post not found');
        } else {
            console.log('Post found:', post);
            res.status(200).json(post);
        }
    });
});

// Update a post by ID
router.put('/posts/:id', (req, res) => {
    const postIdToUpdate = req.params.id;

    Post.findByIdAndUpdate(postIdToUpdate, { text: req.body.text }, { new: true }, (err, post) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error updating post');
        } else if (!post) {
            res.status(404).send('Post not found');
        } else {
            console.log('Post updated:', post);
            res.status(200).json(post);
        }
    });
});

// Delete a post by ID
router.delete('/posts/:id', (req, res) => {
    const postIdToDelete = req.params.id;

    Post.findByIdAndDelete(postIdToDelete, (err, post) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error deleting post');
        } else if (!post) {
            res.status(404).send('Post not found');
        } else {
            console.log('Post deleted:', post);
            res.status(200).json(post);
        }
    });
});

module.exports = router;