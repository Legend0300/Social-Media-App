const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  name: { type: String, required: true },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  bio: {type: String , required: true},
  email: { type: String, required: true },
  password: { type: String, required: true },
  story: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Story' }],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
