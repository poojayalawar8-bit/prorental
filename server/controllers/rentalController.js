const Rental = require('../models/Rental');
const Product = require('../models/Product');

// @desc    Request a product rental
// @route   POST /api/rentals
// @access  Private
const createRentalRequest = async (req, res) => {
  try {
    const { productId, startDate, endDate } = req.body;

    if (!productId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide productId, startDate, and endDate',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if user is attempting to rent their own product
    if (product.ownerId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot rent your own product',
      });
    }

    // Check if product is available
    if (!product.availability) {
      return res.status(400).json({
        success: false,
        message: 'This product is currently unavailable or already rented',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid start or end date format',
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date',
      });
    }

    // Calculate duration in days (minimum 1 day)
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const totalPrice = diffDays * product.pricePerDay;

    const rental = await Rental.create({
      productId: product._id,
      renterId: req.user._id,
      startDate: start,
      endDate: end,
      totalPrice,
      status: 'Pending',
    });

    const populatedRental = await Rental.findById(rental._id)
      .populate('productId')
      .populate('renterId', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Rental request submitted successfully',
      rental: populatedRental,
    });
  } catch (error) {
    console.error('Error creating rental request:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while submitting rental request',
    });
  }
};

// @desc    Get all rentals (Admin view all, or filtered)
// @route   GET /api/rentals
// @access  Private
const getRentals = async (req, res) => {
  try {
    let query = {};

    // Regular users can only see their own rentals or rentals for their products unless admin
    if (req.user.role !== 'admin') {
      const userProducts = await Product.find({ ownerId: req.user._id }).select('_id');
      const productIds = userProducts.map((p) => p._id);

      query = {
        $or: [{ renterId: req.user._id }, { productId: { $in: productIds } }],
      };
    }

    const rentals = await Rental.find(query)
      .populate({
        path: 'productId',
        populate: { path: 'ownerId', select: 'name email' },
      })
      .populate('renterId', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: rentals.length,
      rentals,
    });
  } catch (error) {
    console.error('Error fetching rentals:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching rentals',
    });
  }
};

// @desc    Get rentals where logged in user is the renter
// @route   GET /api/rentals/my-rentals
// @access  Private
const getMyRentals = async (req, res) => {
  try {
    const rentals = await Rental.find({ renterId: req.user._id })
      .populate({
        path: 'productId',
        populate: { path: 'ownerId', select: 'name email' },
      })
      .populate('renterId', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: rentals.length,
      rentals,
    });
  } catch (error) {
    console.error('Error fetching my rentals:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching my rentals',
    });
  }
};

// @desc    Get incoming rental requests for products owned by logged in user
// @route   GET /api/rentals/owner-requests
// @access  Private
const getOwnerRentalRequests = async (req, res) => {
  try {
    const userProducts = await Product.find({ ownerId: req.user._id }).select('_id');
    const productIds = userProducts.map((p) => p._id);

    const rentals = await Rental.find({ productId: { $in: productIds } })
      .populate('productId')
      .populate('renterId', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: rentals.length,
      rentals,
    });
  } catch (error) {
    console.error('Error fetching owner rental requests:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching incoming rental requests',
    });
  }
};

// @desc    Approve a rental request
// @route   PUT /api/rentals/approve/:id
// @access  Private (Product Owner or Admin)
const approveRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id).populate('productId');

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental request not found',
      });
    }

    if (!rental.productId) {
      return res.status(400).json({
        success: false,
        message: 'Associated product no longer exists',
      });
    }

    const isOwner = rental.productId.ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to approve this rental request',
      });
    }

    if (rental.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve request with current status: ${rental.status}`,
      });
    }

    rental.status = 'Approved';
    await rental.save();

    // Mark product as not available while rented
    await Product.findByIdAndUpdate(rental.productId._id, { availability: false });

    const updatedRental = await Rental.findById(rental._id)
      .populate({
        path: 'productId',
        populate: { path: 'ownerId', select: 'name email' },
      })
      .populate('renterId', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Rental request approved successfully. Product is now rented.',
      rental: updatedRental,
    });
  } catch (error) {
    console.error('Error approving rental:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while approving rental',
    });
  }
};

// @desc    Reject a rental request
// @route   PUT /api/rentals/reject/:id
// @access  Private (Product Owner or Admin)
const rejectRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id).populate('productId');

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental request not found',
      });
    }

    const isOwner = rental.productId && rental.productId.ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this rental request',
      });
    }

    if (rental.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject request with current status: ${rental.status}`,
      });
    }

    rental.status = 'Rejected';
    await rental.save();

    const updatedRental = await Rental.findById(rental._id)
      .populate({
        path: 'productId',
        populate: { path: 'ownerId', select: 'name email' },
      })
      .populate('renterId', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Rental request rejected',
      rental: updatedRental,
    });
  } catch (error) {
    console.error('Error rejecting rental:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while rejecting rental',
    });
  }
};

// @desc    Mark a rented product as returned
// @route   PUT /api/rentals/return/:id
// @access  Private (Product Owner, Renter, or Admin)
const returnRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id).populate('productId');

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental record not found',
      });
    }

    const isOwner = rental.productId && rental.productId.ownerId.toString() === req.user._id.toString();
    const isRenter = rental.renterId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isRenter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this rental as returned',
      });
    }

    if (rental.status !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: `Only approved rentals can be marked as returned. Current status: ${rental.status}`,
      });
    }

    rental.status = 'Returned';
    await rental.save();

    // Mark product as available again
    if (rental.productId) {
      await Product.findByIdAndUpdate(rental.productId._id, { availability: true });
    }

    const updatedRental = await Rental.findById(rental._id)
      .populate({
        path: 'productId',
        populate: { path: 'ownerId', select: 'name email' },
      })
      .populate('renterId', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Product returned successfully and marked available for rent',
      rental: updatedRental,
    });
  } catch (error) {
    console.error('Error returning rental:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while returning rental',
    });
  }
};

module.exports = {
  createRentalRequest,
  getRentals,
  getMyRentals,
  getOwnerRentalRequests,
  approveRental,
  rejectRental,
  returnRental,
};
