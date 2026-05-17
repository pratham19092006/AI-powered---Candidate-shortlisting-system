const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const candidateRoutes = require('./routes/candidateRoutes');
const matchRoutes = require('./routes/matchRoutes');
const aiRoutes = require('./routes/aiRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Core middleware for JSON payloads, CORS, and basic API hardening.
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/', (req, res) => {
  res.json({ message: 'Candidate Shortlisting System API is running.' });
});

app.use('/api/candidates', candidateRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/ai', aiRoutes);

// Fallback route for unknown API paths.
app.use((req, res) => {
  res.status(404).json({ message: 'API route not found.' });
});

// Centralized error handler so unexpected failures stay user-friendly.
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
