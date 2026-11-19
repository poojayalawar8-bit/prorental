const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a product title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      trim: true,
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Please provide price per day'],
      min: [0, 'Price per day must be positive'],
    },
    image: {
      type: String,
      required: [true, 'Please provide a product image URL'],
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide product location/city'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
