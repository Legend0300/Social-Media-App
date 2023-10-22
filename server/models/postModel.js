const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  time: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: String,
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
