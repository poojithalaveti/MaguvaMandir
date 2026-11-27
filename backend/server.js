
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./db');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Backend test
app.get('/', (req, res) => {
  res.send('Maguva Mandir Backend is Running!');
});

// Owner login
app.use('/api/auth', authRoutes);
console.log('AUTH ROUTES REGISTERED');

// Product catalogue
app.use('/api/products', productRoutes);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log('MongoDB Connected Successfully!');
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
  }
};

startServer();
