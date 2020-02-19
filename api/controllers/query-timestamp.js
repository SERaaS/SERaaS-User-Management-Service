'use strict';

// File for managing SERaaS Query Timestamps
// These operations are used to store user usage statistics data when using the SERaaS API

const User = require('../models/User'),
    Timestamp = require('../models/Timestamp'),
    ObjectId = require('mongoose').Types.ObjectId;

// Store a SERaaS Query Timestamp object to the database
function sendTimestamp(req, res) {
    const _userId = req.swagger.params.userId.value;

    // User ID must be a valid one before performing the other expensive operations
    if (!ObjectId.isValid(_userId)) {
        return res.status(400).send({
            errorCode: 400,
            message: 'Given user ID must be a valid id string.'
        });
    };

    const _data = req.swagger.params.data.value,
        _fileName = _data.fileName,
        _paramEmotionsAvailable = _data.paramEmotionsAvailable,
        _paramPeriodicQuery = _data.paramPeriodicQuery,
        _output = _data.output;

    // File name should not be just whitespace
    if (/^\s+$/.test(_fileName)) {
        return res.status(400).send({
            errorCode: 400,
            message: 'File name must not be an empty string.'
        });
    }

    // Output of query should be given
    else if (_output.length < 1) {
        return res.status(400).send({
            errorCode: 400,
            message: 'The resulting output of the SERaaS API Query must be given.'
        });
    };

    // Ensuring the given user ID corresponds to a user
    return User.findById(_userId)
    .then(function(user) {

        if (!user) {
            return res.status(404).send({
                errorCode: 404,
                message: 'Given user ID does not associate with any user in the database.'
            });
        };

        // All passes done, create Timestamp
        const newTimestamp = new Timestamp({
            userId: _userId,
            fileName: _fileName,
            output: _output
        });

        if (_paramEmotionsAvailable) {
            newTimestamp.paramEmotionsAvailable = _paramEmotionsAvailable;
        };

        if (_paramPeriodicQuery) {
            newTimestamp.paramPeriodicQuery = _paramPeriodicQuery;
        };

        // Store the new Timestamp into the database
        return newTimestamp.save()
        .then(function(saved) {
            // console.log(saved);

            // Wrap the resulting timestamp object, do not show output variable as it may be a large load
            const result = {
                userId: _userId,
                fileName: saved.fileName,
                dateCreated: saved.dateCreated,
                paramEmotionsAvailable: saved.paramEmotionsAvailable,
                paramPeriodicQuery: saved.paramPeriodicQuery,
            };

            res.status(200).send(result)
        })
    })
    .catch(function(err) {
        // Debug error if caused
        console.log(err);

        res.status(400).send({
            errorCode: 400,
            message: err
        });
    });
};

module.exports = {
    sendTimestamp: sendTimestamp
};