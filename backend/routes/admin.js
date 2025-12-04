const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');
const User = require('../models/User');

// Get All Rides
router.get('/rides', async (req, res) => {
    try {
        const rides = await Ride.find().populate('rider', 'name').populate('driver', 'name').sort({ createdAt: -1 });
        res.json(rides);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Get All Users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
