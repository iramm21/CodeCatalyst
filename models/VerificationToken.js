const mongoose = require('mongoose');

const verificationTokenSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: 7200 // Token expires after 2 hours
    }
});

module.exports = mongoose.model('VerificationToken', verificationTokenSchema);
