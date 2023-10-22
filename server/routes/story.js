const express = require('express');
const router = express.Router();
const Story = require('../models/storyModel');

// Create a new story
router.post('/stories', (req, res) => {
    const newStory = new Story({
        timeSpan: req.body.timeSpan,
        text: req.body.text
    });

    newStory.save((err, story) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error creating story');
        } else {
            console.log('New story created:', story);
            res.status(201).json(story);
        }
    });
});

// Read all stories
router.get('/stories', (req, res) => {
    Story.find({}, (err, stories) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error getting stories');
        } else {
            console.log('All stories:', stories);
            res.status(200).json(stories);
        }
    });
});

// Read a single story by ID
router.get('/stories/:id', (req, res) => {
    const storyId = req.params.id;

    Story.findById(storyId, (err, story) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error getting story');
        } else if (!story) {
            res.status(404).send('Story not found');
        } else {
            console.log('Story found:', story);

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
                        res.status(500).send('Error deleting story');
                    } else {
                        console.log('Story deleted:', deletedStory);
                        res.status(200).send('Story deleted');
                    }
                });
            } else {
                res.status(200).json(story);
            }
        }
    });
});

// Update a story by ID
router.put('/stories/:id', (req, res) => {
    const storyIdToUpdate = req.params.id;

    Story.findByIdAndUpdate(storyIdToUpdate, { text: req.body.text }, { new: true }, (err, story) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error updating story');
        } else if (!story) {
            res.status(404).send('Story not found');
        } else {
            console.log('Story updated:', story);
            res.status(200).json(story);
        }
    });
});

// Delete a story by ID
router.delete('/stories/:id', (req, res) => {
    const storyIdToDelete = req.params.id;

    Story.findByIdAndDelete(storyIdToDelete, (err, story) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error deleting story');
        } else if (!story) {
            res.status(404).send('Story not found');
        } else {
            console.log('Story deleted:', story);
            res.status(200).json(story);
        }
    });
});

module.exports = router;