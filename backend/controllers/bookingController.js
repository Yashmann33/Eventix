const Booking = require('../models/Booking');
const Event = require('../models/Event');
const crypto = require('crypto');

// @route POST /api/bookings/register/:eventId
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    const existingBooking = await Booking.findOne({ event: event._id, user: req.user._id });
    if (existingBooking) {
      return res.status(400).json({ message: 'You are already registered for this event.' });
    }

    const ticketId = 'EVT-' + crypto.randomBytes(6).toString('hex').toUpperCase();

    const booking = await Booking.create({
      event: event._id,
      user: req.user._id,
      ticketId,
    });

    res.status(201).json({
      message: 'Successfully registered!',
      booking,
    });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// @route GET /api/bookings/my-tickets
const getMyTickets = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching your tickets.' });
  }
};

// @route GET /api/bookings/event-attendees/:eventId
const getEventAttendees = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    // Only owner or admin can see attendees
    if (event.proposer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    const bookings = await Booking.find({ event: event._id }).populate('user', 'name email profileImage');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching attendees.' });
  }
};

module.exports = { registerForEvent, getMyTickets, getEventAttendees };
