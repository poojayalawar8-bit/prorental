const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    renterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide rental start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide rental end date'],
    },
    totalPrice: {
      type: Number,
      required: [true, 'Please provide total rental price'],
      min: [0, 'Total price cannot be negative'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Returned'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Rental', rentalSchema);
