const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: {
        required: true,
        type: String,
    },
    email: {
        required: true,
        type: String,
        unique: true,
        match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
    },
    password: {
        required: true,
        type: String,
        minLength: 8,
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;