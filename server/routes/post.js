const express = require('express');
const router = express.Router();
const Post = require('../models/postModel');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');


// Create a new post
router.post('/posts', authMiddleware ,async (req, res) => {
    const id  = req.user.userId;
    const newPost = new Post({
        text: req.body.text,
        user: id
    });

    try {
        const user = await User.findById(id);
        console.log(user);

        const post = await newPost.save();
        if (user.posts) {
            user.posts.push(post);
        } else {
            user.posts = [post];
        }
        await user.save();

        console.log('New post created:', post);
        res.status(201).json(post);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating post');
    }
});

// Read all posts from the users that the current user is following
router.get('/posts_foruser', authMiddleware ,(req, res) => {

    const userId = req.user.userId    ;
  
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
router.get('/posts', authMiddleware ,(req, res) => {
    const userId = req.user.userId;
    
    Post.find({ user: userId }).sort({ likes: -1 }).exec((err, posts) => {
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
router.get('/posts/:id', authMiddleware ,(req, res) => {
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
router.put('/posts/:id', authMiddleware, (req, res) => {
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
router.delete('/posts/:id', authMiddleware ,async (req, res) => {
    const postIdToDelete = req.params.id;

    try {
        const user = await User.findById(req.user.userId);
        user.posts.pull(postIdToDelete);
        await user.save();

        const post = await Post.findByIdAndDelete(postIdToDelete);
        if (!post) {
            res.status(404).send('Post not found');
        } else {
            console.log('Post deleted:', post);
            res.status(200).json(post);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting post');
    }
});


router.post('/posts/like', authMiddleware ,async (req, res) => {
    const postId = req.body.id;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the user has already liked the post
        if (post.likes.includes(req.user.userId.toString())) {
            return res.status(400).json({ message: 'You have already liked this post' });
        }

        post.likes.push(req.user.userId);
        await post.save();

        return res.status(200).json(post);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error liking post' });
    }
});

router.post('/posts/unlike', authMiddleware, async (req, res) => {
    const postId = req.body.id;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the user has already liked the post
        const isLiked = post.likes.includes(req.user.userId.toString());
        if (!isLiked) {
            return res.status(400).json({ message: 'You have not liked this post' });
        }

        // Remove the user's ID from the likes array to unlike the post
        post.likes = post.likes.filter(userId => userId.toString() !== req.user.userId.toString());
        await post.save();

        return res.status(200).json(post);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: `Error unliking post: ${err.message}` });
    }
});





module.exports = router;