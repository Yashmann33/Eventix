const User = require('../models/User');

// @route GET /api/users/pending  (admin only)
const getPendingProposers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ role: 'proposer', isVerified: false, isBlocked: false }).select('-password');
    res.json({ users: pendingUsers });
  } catch (err) {
    console.error('Get pending error:', err);
    res.status(500).json({ message: 'Server error fetching pending proposers.' });
  }
};

// @route POST /api/users/verify/:id  (admin only)
const verifyProposer = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role !== 'proposer') {
      return res.status(400).json({ message: 'User is not a proposer.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Proposer is already verified.' });
    }

    user.isVerified = true;
    await user.save();

    res.json({ message: `Proposer "${user.name}" has been verified successfully.`, user });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ message: 'Server error verifying proposer.' });
  }
};

// @route GET /api/users/all  (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching users.' });
  }
};

// @route DELETE /api/users/:id (admin only)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'admin') return res.status(403).json({ message: 'Admin cannot be deleted' });
        
        await User.findByIdAndDelete(id);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error deleting user' });
    }
};

// @route POST /api/users/block/:id (admin only)
const toggleBlockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'admin') return res.status(403).json({ message: 'Admin cannot be blocked' });
        
        user.isBlocked = !user.isBlocked;
        await user.save();
        res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, isBlocked: user.isBlocked });
    } catch (err) {
        res.status(500).json({ message: 'Server error updating user block status' });
    }
};

// @route POST /api/users/save-event/:eventId
const toggleSaveEvent = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const eventId = req.params.eventId;
        
        const index = user.savedEvents.indexOf(eventId);
        if (index > -1) {
            user.savedEvents.splice(index, 1);
        } else {
            user.savedEvents.push(eventId);
        }
        await user.save();
        
        res.json({ savedEvents: user.savedEvents });
    } catch (err) {
        console.error('Save event error:', err);
        res.status(500).json({ message: 'Server error saving event.' });
    }
};

module.exports = { getPendingProposers, verifyProposer, getAllUsers, deleteUser, toggleBlockUser, toggleSaveEvent };
