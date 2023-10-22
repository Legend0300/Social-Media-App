const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  timeSpan: Date,
  text: String,
});

const Story = mongoose.model('Story', storySchema);

module.exports = Story;
