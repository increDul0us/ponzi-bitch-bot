
const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    uname: String,
    email: String,
    password: String,
    dateCrawled: Date
});

let User = mongoose.model('User', userSchema);

module.exports = User;