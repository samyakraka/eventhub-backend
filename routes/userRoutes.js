const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

const getUsersCollection = (db) => db.collection('users');

router.post('/', async (req, res) => {
  try {
    const user = req.body;
    const db = req.app.locals.db;
    const result = await getUsersCollection(db).insertOne(user);
    res.status(201).json(result.ops[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const users = await getUsersCollection(db).find().toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const user = await getUsersCollection(db).findOne({ _id: ObjectId(req.params.id) });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const updated = await getUsersCollection(db).findOneAndUpdate(
      { _id: ObjectId(req.params.id) },
      { $set: req.body },
      { returnDocument: 'after' }
    );
    if (!updated.value) return res.status(404).json({ error: 'User not found' });
    res.json(updated.value);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await getUsersCollection(db).deleteOne({ _id: ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;