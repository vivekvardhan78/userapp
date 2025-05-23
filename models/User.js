const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    phone: String,
    password: String,
    pincode: String,
    dob: String,
    address: String
});

module.exports = mongoose.model('User', userSchema);