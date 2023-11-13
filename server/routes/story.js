const express = require("express");
const router = express.Router();
const Story = require("../models/storyModel");
const authMiddleware = require("../middleware/auth");

// Create a new story
router.post("/stories", authMiddleware, (req, res) => {
  const userId = req.body.user;
  const newStory = new Story({
    timeSpan: req.body.timeSpan,
    text: req.body.text,
    user: userId,
  });

router.post("/stories", authMiddleware, async (req, res) => {
    const userId = req.body.user;
    const newStory = new Story({
      timeSpan: req.body.timeSpan,
      text: req.body.text,
      user: userId,
    });

    try {
      const story = await newStory.save();
      console.log("New story created:", story);
      res.status(201).json(story);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error creating story");
    }
  });
});

// Read all stories
router.get("/stories", authMiddleware, (req, res) => {
    const userId = req.user.userId;
  Story.find({user: userId}, (err, stories) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error getting stories");
    } else {
      console.log("All stories:", stories);
      res.status(200).json(stories);
    }
  });
});

// Read a single story by ID
router.get("/stories/:id", authMiddleware , (req, res) => {
  const storyId = req.params.id;

  Story.findById(storyId, (err, story) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error getting story");
    } else if (!story) {
      res.status(404).send("Story not found");
    } else {
      console.log("Story found:", story);

      // Check if the story is older than 24 hours
      const now = new Date();
      const createdAt = new Date(story.createdAt);
      const diffInMs = now - createdAt;
      const diffInHours = diffInMs / (1000 * 60 * 60);

      if (diffInHours > 24) {
        // Delete the story if it's older than 24 hours
        Story.findByIdAndDelete(storyId, (err, deletedStory) => {
          if (err) {
            console.error(err);
            res.status(500).send("Error deleting story");
          } else {
            console.log("Story deleted:", deletedStory);
            res.status(200).send("Story deleted");
          }
        });
      } else {
        res.status(200).json(story);
      }
    }
  });
});

// Update a story by ID
router.put("/stories/:id", authMiddleware, (req, res) => {
  const storyIdToUpdate = req.params.id;

  Story.findByIdAndUpdate(
    storyIdToUpdate,
    { text: req.body.text },
    { new: true },
    (err, story) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error updating story");
      } else if (!story) {
        res.status(404).send("Story not found");
      } else {
        console.log("Story updated:", story);
        res.status(200).json(story);
      }
    }
  );
});

// Delete a story by ID
router.delete("/stories/:id", authMiddleware , (req, res) => {
  const storyIdToDelete = req.params.id;

  Story.findByIdAndDelete(storyIdToDelete, (err, story) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error deleting story");
    } else if (!story) {
      res.status(404).send("Story not found");
    } else {
      console.log("Story deleted:", story);
      res.status(200).json(story);
    }
  });
});

module.exports = router;
