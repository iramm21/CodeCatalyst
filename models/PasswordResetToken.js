const mongoose = require('mongoose');

const passwordResetTokenSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    expires: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
