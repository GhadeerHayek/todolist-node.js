const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: {
        required: true,
        type: String,
        match:[/^[a-zA-Z0-9]{3,25}$/, "Name format is not accepted, try different one"],
    },
    email: {
        required: true,
        type: String,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Email format is not accepted, try different one"],
    },
    password: {
        required: true,
        type: String,
        match: [/^(?=.*\d).{8,}$/, "Password format is not accepted, try different one"],
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;