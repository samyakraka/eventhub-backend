const express = require('express');
const { ObjectId } = require('mongodb'); 
const router = express.Router();


const getRegistrationsCollection = (db) => db.collection('registrations');


router.post('/', async (req, res) => {
  try {
    const registration = req.body;
    const db = req.app.locals.db; 
    const result = await getRegistrationsCollection(db).insertOne(registration); 
    res.status(201).json(result.ops[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const registrations = await getRegistrationsCollection(db).find().toArray(); // Retrieve all registrations
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const registration = await getRegistrationsCollection(db).findOne({ _id: ObjectId(req.params.id) }); 
    if (!registration) return res.status(404).json({ error: 'Registration not found' });
    res.json(registration);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const updated = await getRegistrationsCollection(db).findOneAndUpdate(
      { _id: ObjectId(req.params.id) },
      { $set: req.body }, 
      { returnDocument: 'after' }
    );
    if (!updated.value) return res.status(404).json({ error: 'Registration not found' });
    res.json(updated.value); 
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a registration
router.delete('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db; 
    const result = await getRegistrationsCollection(db).deleteOne({ _id: ObjectId(req.params.id) }); // Delete registration by ID
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }
    res.json({ message: 'Registration deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;