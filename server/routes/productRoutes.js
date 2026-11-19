const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

// Public route to get all products & single product
router.get('/', getProducts);
router.get('/owner/my-listings', protect, getMyProducts);
router.get('/:id', getProductById);

// Protected routes for product operations
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
