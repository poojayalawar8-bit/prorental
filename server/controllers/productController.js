const Product = require('../models/Product');
const Rental = require('../models/Rental');

// @desc    Get all products with search, category and filter
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { search, category, availability, location, sort } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (availability !== undefined && availability !== '') {
      query.availability = availability === 'true';
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { pricePerDay: 1 };
    else if (sort === 'price_desc') sortOptions = { pricePerDay: -1 };
    else if (sort === 'oldest') sortOptions = { createdAt: 1 };

    const products = await Product.find(query)
      .populate('ownerId', 'name email role')
      .sort(sortOptions);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching products',
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'ownerId',
      'name email role'
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Invalid product ID or server error',
    });
  }
};

// @desc    Create a new product listing
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      pricePerDay,
      image,
      location,
      availability,
    } = req.body;

    if (!title || !description || !category || !pricePerDay || !image || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (title, description, category, pricePerDay, image, location)',
      });
    }

    const newProduct = await Product.create({
      title,
      description,
      category,
      pricePerDay: Number(pricePerDay),
      image,
      location,
      availability: availability !== undefined ? availability : true,
      ownerId: req.user._id,
    });

    const populatedProduct = await Product.findById(newProduct._id).populate(
      'ownerId',
      'name email role'
    );

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: populatedProduct,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating product',
    });
  }
};

// @desc    Update an existing product
// @route   PUT /api/products/:id
// @access  Private (Owner or Admin)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check ownership or admin role
    const isOwner = product.ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product listing',
      });
    }

    const {
      title,
      description,
      category,
      pricePerDay,
      image,
      location,
      availability,
    } = req.body;

    if (title !== undefined) product.title = title;
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (pricePerDay !== undefined) product.pricePerDay = Number(pricePerDay);
    if (image !== undefined) product.image = image;
    if (location !== undefined) product.location = location;
    if (availability !== undefined) product.availability = availability;

    const updatedProduct = await product.save();
    const populated = await Product.findById(updatedProduct._id).populate(
      'ownerId',
      'name email role'
    );

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: populated,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating product',
    });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Owner or Admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const isOwner = product.ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product listing',
      });
    }

    // Delete associated rentals if needed
    await Rental.deleteMany({ productId: product._id });
    await Product.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Product and associated rentals removed successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while deleting product',
    });
  }
};

// @desc    Get listings owned by logged in user
// @route   GET /api/products/owner/my-listings
// @access  Private
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ ownerId: req.user._id })
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
};
