const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    rider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    pickupLocation: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true },
        address: String
    },
    dropoffLocation: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true },
        address: String
    },
    vehicleType: { type: String, enum: ['bike', 'auto', 'car'], default: 'bike' },
    status: {
        type: String,
        enum: ['requested', 'accepted', 'started', 'completed', 'cancelled'],
        default: 'requested'
    },
    fare: { type: Number },
    distance: { type: Number }, // in km
    duration: { type: Number } // in minutes
}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);