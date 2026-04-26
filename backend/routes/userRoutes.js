const express = require('express');
const router = express.Router();
const { getPendingProposers, verifyProposer, getAllUsers, deleteUser, toggleBlockUser, toggleSaveEvent } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/pending', protect, admin, getPendingProposers);
router.post('/verify/:id', protect, admin, verifyProposer);
router.get('/all', protect, admin, getAllUsers);
router.delete('/:id', protect, admin, deleteUser);
router.post('/block/:id', protect, admin, toggleBlockUser);

// User protected route
router.post('/save-event/:eventId', protect, toggleSaveEvent);

module.exports = router;
