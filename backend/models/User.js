const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['rider', 'driver'], required: true },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
    },
    isAvailable: { type: Boolean, default: false } // Only for drivers
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);    