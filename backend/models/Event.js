const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Music', 'Sports', 'Tech', 'Art', 'Food', 'Business', 'Education', 'Health', 'Other'],
    },
    theme: {
      type: String,
      required: [true, 'Theme is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    image: {
      type: String,
      default: null,
    },
    proposer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    proposerName: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
