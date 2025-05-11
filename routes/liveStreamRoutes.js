const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

const getLiveStreamsCollection = (db) => db.collection('livestreams');

// Create new livestream
router.post('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const {
      eventId,
      streamPlatform,
      streamLink,
      isLive = false,
      recordingLink = null,
      chatEnabled = true,
      accessRestricted = false
    } = req.body;

    if (!eventId || !streamPlatform || !streamLink) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newStream = {
      eventId: new ObjectId(eventId),
      streamPlatform,
      streamLink,
      isLive,
      recordingLink,
      chatEnabled,
      accessRestricted,
      timestamp: new Date()
    };

    const result = await getLiveStreamsCollection(db).insertOne(newStream);
    const inserted = await getLiveStreamsCollection(db).findOne({ _id: result.insertedId });

    res.status(201).json(inserted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all livestreams
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const streams = await getLiveStreamsCollection(db).find().toArray();
    res.json(streams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get livestream by eventId
router.get('/:eventId', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const stream = await getLiveStreamsCollection(db).findOne({
      eventId: new ObjectId(req.params.eventId)
    });

    if (!stream) return res.status(404).json({ error: 'Stream not found' });

    res.json(stream);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Toggle isLive status
router.patch('/:eventId/toggle', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { isLive } = req.body;

    const updated = await getLiveStreamsCollection(db).findOneAndUpdate(
      { eventId: new ObjectId(req.params.eventId) },
      { $set: { isLive: !!isLive } },
      { returnDocument: 'after' }
    );

    if (!updated.value) return res.status(404).json({ error: 'Stream not found' });

    res.json(updated.value);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
