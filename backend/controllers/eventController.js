const Event = require('../models/Event');
const Booking = require('../models/Booking');

// @route POST /api/events  (proposer only, verified)
const createEvent = async (req, res) => {
  try {
    const { title, description, category, theme, location, date } = req.body;

    if (!title || !description || !category || !theme || !location || !date) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    const imageUrl = req.file ? req.file.path : null;

    const event = await Event.create({
      title,
      description,
      category,
      theme,
      location,
      date,
      image: imageUrl,
      proposer: req.user._id,
      proposerName: req.user.name,
    });

    res.status(201).json({ message: 'Event created successfully!', event });
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ message: 'Server error creating event.' });
  }
};

// @route GET /api/events
const getEvents = async (req, res) => {
  try {
    const { category, theme, location } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (theme) filter.theme = { $regex: theme, $options: 'i' };
    if (location) filter.location = { $regex: location, $options: 'i' };

    const events = await Event.find(filter).populate('proposer', 'name email').sort({ date: 1 }).lean();
    for (let ev of events) {
      ev.attendeesCount = await Booking.countDocuments({ event: ev._id });
    }
    res.json(events);
  } catch (err) {
    console.error('Get events error:', err);
    res.status(500).json({ message: 'Server error fetching events.' });
  }
};

// @route GET /api/events/search
const searchEvents = async (req, res) => {
  try {
    const { keyword, category, theme, location } = req.query;
    const filter = {};

    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { location: { $regex: keyword, $options: 'i' } },
        { theme: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (category) filter.category = category;
    if (theme) filter.theme = { $regex: theme, $options: 'i' };
    if (location) filter.location = { $regex: location, $options: 'i' };

    const events = await Event.find(filter).populate('proposer', 'name email').sort({ date: 1 }).lean();
    for (let ev of events) {
      ev.attendeesCount = await Booking.countDocuments({ event: ev._id });
    }
    res.json(events);
  } catch (err) {
    console.error('Search events error:', err);
    res.status(500).json({ message: 'Server error searching events.' });
  }
};

// @route PUT /api/events/:id  (proposer who owns it, or admin)
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Only the proposer who created it or admin can update
    if (event.proposer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this event.' });
    }

    const { title, description, category, theme, location, date } = req.body;
    if (title) event.title = title;
    if (description) event.description = description;
    if (category) event.category = category;
    if (theme) event.theme = theme;
    if (location) event.location = location;
    if (date) event.date = date;
    if (req.file) event.image = req.file.path;

    const updated = await event.save();
    res.json({ message: 'Event updated successfully!', event: updated });
  } catch (err) {
    console.error('Update event error:', err);
    res.status(500).json({ message: 'Server error updating event.' });
  }
};

// @route DELETE /api/events/:id
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (event.proposer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this event.' });
    }

    await event.deleteOne();
    res.json({ message: 'Event deleted successfully.' });
  } catch (err) {
    console.error('Delete event error:', err);
    res.status(500).json({ message: 'Server error deleting event.' });
  }
};

// @route GET /api/events/my  (proposer's own events)
const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ proposer: req.user._id }).sort({ date: 1 }).lean();
    for (let ev of events) {
      ev.attendeesCount = await Booking.countDocuments({ event: ev._id });
    }
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching your events.' });
  }
};

module.exports = { createEvent, getEvents, searchEvents, updateEvent, deleteEvent, getMyEvents };
