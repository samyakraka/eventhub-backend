const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

const getCheckInsCollection = (db) => db.collection('checkins');

router.post('/', async (req, res) => {
  try {
    const checkin = req.body;
    const db = req.app.locals.db;
    const result = await getCheckInsCollection(db).insertOne(checkin);
    res.status(201).json(result.ops[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const checkins = await getCheckInsCollection(db).find().toArray();
    res.json(checkins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const checkin = await getCheckInsCollection(db).findOne({ _id: ObjectId(req.params.id) });
    if (!checkin) return res.status(404).json({ error: 'Check-in not found' });
    res.json(checkin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const updated = await getCheckInsCollection(db).findOneAndUpdate(
      { _id: ObjectId(req.params.id) },
      { $set: req.body },
      { returnDocument: 'after' }
    );
    if (!updated.value) return res.status(404).json({ error: 'Check-in not found' });
    res.json(updated.value);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await getCheckInsCollection(db).deleteOne({ _id: ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Check-in not found' });
    res.json({ message: 'Check-in deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;