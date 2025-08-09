const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const {
  submitRating,
  getUserRatingsForStore,
  getRatingsForStoreOwner
} = require('../controllers/ratingController');

// Normal user submits or updates rating
router.post('/:storeId', verifyToken, requireRole('user'), submitRating);

// Get all ratings for a specific store (for owner)
router.get('/store/:storeId', verifyToken, getUserRatingsForStore);

// Store owner fetches ratings for their own store
router.get('/owner', verifyToken, requireRole('storeOwner'), getRatingsForStoreOwner);

module.exports = router;
