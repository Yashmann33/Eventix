const express = require('express');
const router = express.Router();
const { registerForEvent, getMyTickets, getEventAttendees } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register/:eventId', protect, registerForEvent);
router.get('/my-tickets', protect, getMyTickets);
router.get('/event-attendees/:eventId', protect, getEventAttendees);

module.exports = router;
