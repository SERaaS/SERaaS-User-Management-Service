const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// Timestamp query object, stores data relating to a single API call from a user
const timestampSchema = Schema(
    {
        userId: { type: mongoose.Types.ObjectId, default: '' },
        fileName: { type: String, default: '' },
        
        // Query date
        dateCreated: { type: Date, default: new Date() },

        // Parameters of the API endpoint used
        paramEmotionsAvailable: [{ type: String, default: '' }],
        paramPeriodicQuery: { type: Number, default: -1 },

        // Resulting output
        output: {}
    },

    {
        collection: 'timestampsDB'
    }
);

// Allowing efficient querying by setting what fields to query using
timestampSchema.set('autoIndex', false);
timestampSchema.index({ _id: 1, userId: 1 });

const model = mongoose.model('Timestamp', timestampSchema);
module.exports = model;