const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// Storing basic user metadata for a user
const userSchema = Schema(
    {
        name: { type: String, default: '' },
        password: { type: String, default: '' },
        dateCreated: { type: Date, default: new Date() },
        lastUsed: { type: Date, default: new Date() }
    },

    {
        collection: 'usersDB'
    }
);

// Allowing efficient querying by setting what fields to query using
userSchema.set('autoIndex', false);
userSchema.index({ _id: 1, name: 1 });

const model = mongoose.model('User', userSchema);
module.exports = model;