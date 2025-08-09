const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { getDashboardStats, getAllUsers } = require('../controllers/adminController');

router.get('/dashboard', verifyToken, requireRole('admin'), getDashboardStats);
router.get('/users', verifyToken, requireRole('admin'), getAllUsers);

module.exports = router;
