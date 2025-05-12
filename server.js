const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

dotenv.config();

const app = express();

// ✅ Support large payloads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Allowlist for CORS
const allowedOrigins = [
  'https://eventhub2.vercel.app',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin like mobile apps or curl
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

const mongoURI = process.env.MONGO_URI;
let db;

MongoClient.connect(mongoURI)
  .then(client => {
    console.log('MongoDB connected');
    db = client.db('eventhub');
    app.locals.db = db;

    // Routes
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

    // ✅ CORS test route
    app.get('/api/test', (req, res) => {
      res.json({ message: 'CORS test successful! Backend is working.' });
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err);
  });
