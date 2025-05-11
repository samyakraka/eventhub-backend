const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

const getChatCollection = (db) => db.collection('chat');

router.post('/', async (req, res) => {
  try {
    const chatMessage = req.body;
    const db = req.app.locals.db;
    const result = await getChatCollection(db).insertOne(chatMessage);
    res.status(201).json(result.ops[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/event/:eventId', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const chatMessages = await getChatCollection(db).find({ eventId: req.params.eventId }).toArray();
    if (chatMessages.length === 0) {
      return res.status(404).json({ error: 'No chat messages found for this event' });
    }
    res.json(chatMessages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const chatMessages = await getChatCollection(db).find({ userId: req.params.userId }).toArray();
    if (chatMessages.length === 0) {
      return res.status(404).json({ error: 'No chat messages found for this user' });
    }
    res.json(chatMessages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await getChatCollection(db).deleteOne({ _id: ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Chat message not found' });
    }
    res.json({ message: 'Chat message deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;