require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./config/database');

const authRoutes = require('./routes/auth');
const tokenRoutes = require('./routes/token');

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3624',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/auth', authRoutes);
app.use('/token', tokenRoutes);

app.get('/health', (req, res) => {
  res.json({ error: false, data: { status: 'ok' } });
});

app.use((req, res) => {
  res.status(404).json({ error: true, message: 'Route not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: true, message: 'Internal server error' });
});

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
