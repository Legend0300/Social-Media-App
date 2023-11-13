const request = require('supertest');
const express = require('express');
const app = express();const mongoose = require('mongoose');
const Post = require('./models/postModel');
const User = require('./models/userModel');
const jwt = require('jsonwebtoken');

describe('Post routes', () => {
  let user;
  let token;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });

    user = new User({
      name: 'Test User',
      email: 'testuser@test.com',
      password: 'password'
    });

    await user.save();

    token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /posts', () => {
    it('should create a new post', async () => {
      const res = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          text: 'Test post',
          user: user._id
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.text).toEqual('Test post');
      expect(res.body.user).toEqual(user._id.toString());
    });

    it('should return an error if text is missing', async () => {
      const res = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: user._id
        });

      expect(res.statusCode).toEqual(500);
      expect(res.text).toContain('Error creating post');
    });

    it('should return an error if user is missing', async () => {
      const res = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          text: 'Test post'
        });

      expect(res.statusCode).toEqual(500);
      expect(res.text).toContain('Error creating post');
    });
  });

  describe('GET /posts_foruser', () => {
    it('should return all posts from the users that the current user is following', async () => {
      const user2 = new User({
        name: 'Test User 2',
        email: 'testuser2@test.com',
        password: 'password'
      });

      await user2.save();

      const post1 = new Post({
        text: 'Test post 1',
        user: user2._id
      });

      const post2 = new Post({
        text: 'Test post 2',
        user: user._id
      });

      const post3 = new Post({
        text: 'Test post 3',
        user: user2._id
      });

      await post1.save();
      await post2.save();
      await post3.save();

      user.following.push({ user: user2._id });
      await user.save();

      const res = await request(app)
        .get('/posts_foruser')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(3);
      expect(res.body[0].text).toEqual('Test post 2');
      expect(res.body[1].text).toEqual('Test post 1');
      expect(res.body[2].text).toEqual('Test post 3');
    });

    it('should return an error if user is not found', async () => {
      const res = await request(app)
        .get('/posts_foruser')
        .set('Authorization', `Bearer ${jwt.sign({ userId: mongoose.Types.ObjectId() }, process.env.JWT_SECRET)}`);

      expect(res.statusCode).toEqual(404);
      expect(res.text).toContain('User not found');
    });
  });

  describe('GET /posts', () => {
    it('should return all posts sorted by likes', async () => {
      const post1 = new Post({
        text: 'Test post 1',
        user: user._id,
        likes: 2
      });

      const post2 = new Post({
        text: 'Test post 2',
        user: user._id,
        likes: 1
      });

      const post3 = new Post({
        text: 'Test post 3',
        user: user._id,
        likes: 3
      });

      await post1.save();
      await post2.save();
      await post3.save();

      const res = await request(app)
        .get('/posts')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(3);
      expect(res.body[0].text).toEqual('Test post 3');
      expect(res.body[1].text).toEqual('Test post 1');
      expect(res.body[2].text).toEqual('Test post 2');
    });
  });

  describe('GET /posts/:id', () => {
    it('should return a single post by ID', async () => {
      const post = new Post({
        text: 'Test post',
        user: user._id
      });

      await post.save();

      const res = await request(app)
        .get(`/posts/${post._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.text).toEqual('Test post');
      expect(res.body.user).toEqual(user._id.toString());
    });

    it('should return an error if post is not found', async () => {
      const res = await request(app)
        .get(`/posts/${mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
      expect(res.text).toContain('Post not found');
    });
  });

  describe('PUT /posts/:id', () => {
    it('should update a post by ID', async () => {
      const post = new Post({
        text: 'Test post',
        user: user._id
      });

      await post.save();

      const res = await request(app)
        .put(`/posts/${post._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          text: 'Updated test post'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.text).toEqual('Updated test post');
      expect(res.body.user).toEqual(user._id.toString());
    });

    it('should return an error if post is not found', async () => {
      const res = await request(app)
        .put(`/posts/${mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          text: 'Updated test post'
        });

      expect(res.statusCode).toEqual(404);
      expect(res.text).toContain('Post not found');
    });
  });

  describe('DELETE /posts/:id', () => {
    it('should delete a post by ID', async () => {
      const post = new Post({
        text: 'Test post',
        user: user._id
      });

      await post.save();

      const res = await request(app)
        .delete(`/posts/${post._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.text).toEqual('Test post');
      expect(res.body.user).toEqual(user._id.toString());

      const deletedPost = await Post.findById(post._id);
      expect(deletedPost).toBeNull();
    });

    it('should return an error if post is not found', async () => {
      const res = await request(app)
        .delete(`/posts/${mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
      expect(res.text).toContain('Post not found');
    });
  });
});


