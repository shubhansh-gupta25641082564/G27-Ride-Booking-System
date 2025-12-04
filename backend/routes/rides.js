const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');
const User = require('../models/User');

// Request a Ride
router.post('/request', async (req, res) => {
    try {
        const { riderId, pickup, dropoff, distance, vehicleType } = req.body;

        // Calculate Fare
        const rates = { bike: 10, auto: 15, car: 25 }; // Rate per km
        const baseFare = { bike: 20, auto: 30, car: 50 };
        const rate = rates[vehicleType] || rates.bike;
        const base = baseFare[vehicleType] || baseFare.bike;
        const estimatedFare = Math.round(base + (rate * distance));

        // Create Ride
        const ride = new Ride({
            rider: riderId,
            pickupLocation: { coordinates: pickup.coordinates, address: pickup.address },
            dropoffLocation: { coordinates: dropoff.coordinates, address: dropoff.address },
            vehicleType,
            distance,
            fare: estimatedFare,
            status: 'requested'
        });
        await ride.save();

        // Emit socket event to drivers
        req.io.emit('ride_requested', ride);

        res.json(ride);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Get Available Rides (For Drivers)
router.get('/available', async (req, res) => {
    try {
        const rides = await Ride.find({ status: 'requested' }).populate('rider', 'name');
        res.json(rides);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Accept Ride
router.put('/:id/accept', async (req, res) => {
    try {
        const { driverId } = req.body;
        let ride = await Ride.findById(req.params.id);
        if (!ride) return res.status(404).json({ msg: 'Ride not found' });
        if (ride.status !== 'requested') return res.status(400).json({ msg: 'Ride already accepted' });

        ride.driver = driverId;
        ride.status = 'accepted';
        await ride.save();

        // Notify rider
        req.io.to(ride.rider.toString()).emit('ride_accepted', ride);

        res.json(ride);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Update Ride Status (Started, Completed)
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        let ride = await Ride.findById(req.params.id);
        if (!ride) return res.status(404).json({ msg: 'Ride not found' });

        ride.status = status;
        await ride.save();

        // Notify rider
        const rideWithDetails = await Ride.findById(ride._id).populate('driver', 'name');
        req.io.to(ride.rider.toString()).emit('ride_status_updated', rideWithDetails);

        res.json(ride);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
