const mongoose = require('mongoose');

let usersDOM = mongoose.Schema(
    {

    },

    {
        collection: 'usersDB'
    }
)

module.exports = mongoose.model('User', usersDOM);