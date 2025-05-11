const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

const getEventsCollection = (db) => db.collection('events');

const validateEventData = (req, res, next) => {
  const { title, startTime, endTime, eventType } = req.body;
  
  if (!title || !startTime || !endTime || !eventType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (new Date(startTime) >= new Date(endTime)) {
    return res.status(400).json({ error: 'End time must be after start time' });
  }
  
  next();
};


router.post('/', validateEventData, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const event = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: req.body.status || 'upcoming'
    };
    const result = await getEventsCollection(db).insertOne(event);
    const createdEvent = await getEventsCollection(db).findOne({ _id: result.insertedId });
    res.status(201).json(createdEvent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { status, eventType } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (eventType) query.eventType = eventType;
    
    const events = await getEventsCollection(db)
      .find(query)
      .sort({ startTime: 1 })
      .toArray();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    const event = await getEventsCollection(db).findOne({ _id: new ObjectId(req.params.id) });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', validateEventData, async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    const result = await getEventsCollection(db).findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    if (!result.value) return res.status(404).json({ error: 'Event not found' });
    res.json(result.value);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    const result = await getEventsCollection(db).deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;