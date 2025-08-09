const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const {
  addStore,
  getAllStores,
  getStoreById,
  updateStore,
  deleteStore
} = require('../controllers/storeController');

router.post('/', verifyToken, requireRole('admin'), addStore);
router.get('/', verifyToken, getAllStores);
router.get('/:id', verifyToken, getStoreById);
router.put('/:id', verifyToken, requireRole('admin'), updateStore);
router.delete('/:id', verifyToken, requireRole('admin'), deleteStore);

module.exports = router;
