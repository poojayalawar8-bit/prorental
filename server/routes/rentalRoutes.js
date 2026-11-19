const express = require('express');
const router = express.Router();
const {
  createRentalRequest,
  getRentals,
  getMyRentals,
  getOwnerRentalRequests,
  approveRental,
  rejectRental,
  returnRental,
} = require('../controllers/rentalController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createRentalRequest);
router.get('/', protect, getRentals);
router.get('/my-rentals', protect, getMyRentals);
router.get('/owner-requests', protect, getOwnerRentalRequests);
router.put('/approve/:id', protect, approveRental);
router.put('/reject/:id', protect, rejectRental);
router.put('/return/:id', protect, returnRental);

module.exports = router;
