const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const storeRoutes = require('./routes/storeRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

db.query('SELECT 1')
  .then(() => console.log(' MySQL Connected!'))
  .catch((err) => console.error('MySQL Connection Failed:', err));


app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/admin', adminRoutes);




const { verifyToken, requireRole } = require('./middleware/authMiddleware');

app.get('/api/test/user', verifyToken, (req, res) => {
  res.send(`Hello ${req.user.role}, you're verified!`);
});

app.get('/api/test/admin', verifyToken, requireRole('admin'), (req, res) => {
  res.send(`Admin access granted`);
});


// Default route
app.get("/", (req, res) => {
  res.send("API is working");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
