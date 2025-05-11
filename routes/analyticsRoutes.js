const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

const getAnalyticsCollection = (db) => db.collection('analytics');

router.post('/', async (req, res) => {
  try {
    const analytics = req.body;
    const db = req.app.locals.db;
    const result = await getAnalyticsCollection(db).insertOne(analytics);
    res.status(201).json(result.ops[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const analyticsRecords = await getAnalyticsCollection(db).find().toArray();
    res.json(analyticsRecords);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/event/:eventId', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const analytics = await getAnalyticsCollection(db).find({ eventId: req.params.eventId }).toArray();
    if (analytics.length === 0) {
      return res.status(404).json({ error: 'Analytics not found for this event' });
    }
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const updatedAnalytics = await getAnalyticsCollection(db).findOneAndUpdate(
      { _id: ObjectId(req.params.id) },
      { $set: req.body },
      { returnDocument: 'after' }
    );
    if (!updatedAnalytics.value) {
      return res.status(404).json({ error: 'Analytics record not found' });
    }
    res.json(updatedAnalytics.value);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await getAnalyticsCollection(db).deleteOne({ _id: ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Analytics record not found' });
    }
    res.json({ message: 'Analytics record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;