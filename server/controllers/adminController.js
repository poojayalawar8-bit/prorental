const User = require('../models/User');
const Product = require('../models/Product');
const Rental = require('../models/Rental');

// @desc    Get dashboard statistics for admin
// @route   GET /api/admin/stats
// @access  Private (Admin Only)
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalRentals = await Rental.countDocuments();

    const pendingRentals = await Rental.countDocuments({ status: 'Pending' });
    const approvedRentals = await Rental.countDocuments({ status: 'Approved' });
    const returnedRentals = await Rental.countDocuments({ status: 'Returned' });
    const rejectedRentals = await Rental.countDocuments({ status: 'Rejected' });

    // Calculate total rental transaction value
    const revenueAggregation = await Rental.aggregate([
      { $match: { status: { $in: ['Approved', 'Returned'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    // Category breakdown
    const categoryStats = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Recent activity
    const recentRentals = await Rental.find()
      .populate('productId', 'title image')
      .populate('renterId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalRentals,
        pendingRentals,
        approvedRentals,
        returnedRentals,
        rejectedRentals,
        totalRevenue,
        categoryStats,
        recentRentals,
      },
    });
  } catch (error) {
    console.error('Error calculating admin stats:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while calculating statistics',
    });
  }
};

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Private (Admin Only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    // Enrich with products and rentals count
    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        const productCount = await Product.countDocuments({ ownerId: u._id });
        const rentalCount = await Rental.countDocuments({ renterId: u._id });
        return {
          ...u.toObject(),
          productCount,
          rentalCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: enrichedUsers.length,
      users: enrichedUsers,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching users',
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin Only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Admin cannot delete their own account',
      });
    }

    // Delete user's products and rentals
    await Product.deleteMany({ ownerId: user._id });
    await Rental.deleteMany({ renterId: user._id });
    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'User and associated data deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while deleting user',
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin Only)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "user" or "admin"',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  deleteUser,
  updateUserRole,
};
