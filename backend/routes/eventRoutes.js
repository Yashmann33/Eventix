const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  searchEvents,
  updateEvent,
  deleteEvent,
  getMyEvents,
} = require('../controllers/eventController');
const { protect, proposerOnly } = require('../middleware/authMiddleware');
const { uploadEvent } = require('../config/cloudinary');

// Public routes
router.get('/', getEvents);
router.get('/search', searchEvents);

// Protected routes
router.get('/my', protect, proposerOnly, getMyEvents);
router.post('/', protect, proposerOnly, uploadEvent.single('image'), createEvent);
router.put('/:id', protect, proposerOnly, uploadEvent.single('image'), updateEvent);
router.delete('/:id', protect, proposerOnly, deleteEvent);

module.exports = router;
