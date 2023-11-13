const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  timeSpan: Date,
  text: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const Story = mongoose.model('Story', storySchema);

module.exports = Story;
