const express = require('express');
const { ObjectId } = require('mongodb'); // Import ObjectId from MongoDB driver
const router = express.Router();

// Get the MongoDB collection
const getTicketsCollection = (db) => db.collection('tickets');

// Create a new ticket
router.post('/', async (req, res) => {
  try {
    const ticket = req.body; // Get ticket data from the request body
    const db = req.app.locals.db; // Access the database from app.locals
    const result = await getTicketsCollection(db).insertOne(ticket); // Insert ticket into the 'tickets' collection
    res.status(201).json(result.ops[0]); // Return the created ticket
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all tickets
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db; // Access the database from app.locals
    const tickets = await getTicketsCollection(db).find().toArray(); // Retrieve all tickets
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a ticket by ID
router.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db; // Access the database from app.locals
    const ticket = await getTicketsCollection(db).findOne({ _id: ObjectId(req.params.id) }); // Find ticket by ID
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a ticket
router.put('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db; // Access the database from app.locals
    const updated = await getTicketsCollection(db).findOneAndUpdate(
      { _id: ObjectId(req.params.id) }, // Find ticket by ID
      { $set: req.body }, // Update ticket data
      { returnDocument: 'after' } // Return the updated document
    );
    if (!updated.value) return res.status(404).json({ error: 'Ticket not found' });
    res.json(updated.value); // Return the updated ticket
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a ticket
router.delete('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db; // Access the database from app.locals
    const result = await getTicketsCollection(db).deleteOne({ _id: ObjectId(req.params.id) }); // Delete ticket by ID
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json({ message: 'Ticket deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;