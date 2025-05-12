const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'https://eventhub2.vercel.app',
  credentials: true
}));

const mongoURI = process.env.MONGO_URI;
let db;

MongoClient.connect(mongoURI)
  .then(client => {
    console.log('MongoDB connected');
    db = client.db('eventhub');
    app.locals.db = db;
    const eventRoutes = require('./routes/eventRoutes');
    const userRoutes = require('./routes/userRoutes');
    const fundraiserRoutes = require('./routes/fundraiserRoutes');
    const chatRoutes = require('./routes/chatRoutes');
    const liveStreamRoutes = require('./routes/liveStreamRoutes');
    const analyticsRoutes = require('./routes/analyticsRoutes');
    const ticketRoutes = require('./routes/ticketRoutes');
    const checkInRoutes = require('./routes/checkInRoutes');
    const registrationRoutes = require('./routes/registrationRoutes');

    app.use('/api/users', userRoutes);
    app.use('/api/events', eventRoutes);
    app.use('/api/fundraisers', fundraiserRoutes);
    app.use('/api/chats', chatRoutes);
    app.use('/api/live-streams', liveStreamRoutes);
    app.use('/api/analytics', analyticsRoutes);
    app.use('/api/tickets', ticketRoutes);
    app.use('/api/check-ins', checkInRoutes);
    app.use('/api/registrations', registrationRoutes);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err);
  });
