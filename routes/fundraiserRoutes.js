const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

const getFundraisersCollection = (db) => db.collection('fundraisers');

router.post('/', async (req, res) => {
  try {
    const fundraiser = req.body;
    const db = req.app.locals.db;
    const result = await getFundraisersCollection(db).insertOne(fundraiser);
    res.status(201).json(result.ops[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/event/:eventId', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const fundraisers = await getFundraisersCollection(db).find({ eventId: req.params.eventId }).toArray();
    if (fundraisers.length === 0) {
      return res.status(404).json({ error: 'No fundraisers found for this event' });
    }
    res.json(fundraisers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const fundraiser = await getFundraisersCollection(db).findOne({ _id: ObjectId(req.params.id) });
    if (!fundraiser) {
      return res.status(404).json({ error: 'Fundraiser not found' });
    }
    res.json(fundraiser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const updated = await getFundraisersCollection(db).findOneAndUpdate(
      { _id: ObjectId(req.params.id) },
      { $set: req.body },
      { returnDocument: 'after' }
    );
    if (!updated.value) {
      return res.status(404).json({ error: 'Fundraiser not found' });
    }
    res.json(updated.value);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await getFundraisersCollection(db).deleteOne({ _id: ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Fundraiser not found' });
    }
    res.json({ message: 'Fundraiser deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;