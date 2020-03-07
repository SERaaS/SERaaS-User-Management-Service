'use strict';

// File for managing SERaaS API Timestamps
// These operations are used to store user usage statistics data (Timestamps) when making SERaaS API calls

const User = require('../models/User'),
  Timestamp = require('../models/Timestamp'),
  ObjectId = require('mongoose').Types.ObjectId;

/**
 * Store a Timestamp object to the database
 */
function sendTimestamp(req, res) {
  const _userId = req.swagger.params.userId.value;

  // User ID must be a valid one before performing the other operations
  if (!ObjectId.isValid(_userId)) {
    return res.status(400).send({
      errorCode: 400,
      message: 'Given user ID must be a valid ID string.'
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
      message: 'The resulting output of the SERaaS API call must be given.'
    });
  };

  // Ensuring the given user ID corresponds to a user
  // Update its last used property while checking
  return User.findOneAndUpdate({ _id: _userId }, { $set: { lastUsed: new Date() } }, { upsert: false })
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
      dateCreated: new Date(),
      output: _output
    });

    if (_paramEmotionsAvailable) { newTimestamp.paramEmotionsAvailable = _paramEmotionsAvailable; };
    if (_paramPeriodicQuery) { newTimestamp.paramPeriodicQuery = _paramPeriodicQuery; };

    // Store the new Timestamp into the database
    return newTimestamp.save()
    .then(function(saved) {

      // Wrap the resulting timestamp object, do not show output variable as it may be a large load
      const result = {
        _id: saved._id,
        userId: _userId,
        fileName: saved.fileName,
        dateCreated: saved.dateCreated
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

/**
 * List all Timestamp IDs for the given user credentials
 */
function listTimestamps(req, res) {
  const _userId = req.swagger.params.userId.value;

  // User ID must be a valid one before performing the other operations
  if (!ObjectId.isValid(_userId)) {
    return res.status(400).send({
      errorCode: 400,
      message: 'Given user ID must be a valid ID string.'
    });
  };

  // Ensuring the given user ID corresponds to a user
  // Update its last used property while checking
  return User.findOneAndUpdate({ _id: _userId }, { $set: { lastUsed: new Date() } }, { upsert: false })
  .then(function(user) {

    if (!user) {
      return res.status(404).send({
        errorCode: 404,
        message: 'Given user ID does not associate with any user in the database.'
      });
    };

    // Search for all timestamps associated with the user, only output the id to prevent overload
    return Timestamp.find({ userId: _userId }, { _id: 1 })
    .then(function(result) {
      let timestamps = [];
      
      // Wrap as an array of ids
      // e.g. [{ _id: 'id1' }, { _id: 'id2' }] -> ['id1', 'id2']
      result.forEach(function(idObj) {
        timestamps.push(idObj._id);
      });

      res.status(200).send(timestamps);
    });
  })
  .catch(function(err) {
    // Debug error if caused
    console.log(err);

    res.status(400).send({
      errorCode: 400,
      message: err
    });
  })
};

/**
 * Load a Timestamp based on its ID for the given user
 */
function loadTimestamp(req, res) {
  const _userId = req.swagger.params.userId.value,
    _queryId = req.swagger.params.queryId.value;

  // User ID must be a valid one before performing the other operations
  if (!ObjectId.isValid(_userId)) {
    return res.status(400).send({
      errorCode: 400,
      message: 'Given user ID must be a valid ID string.'
    });
  }

  // Query ID must also be valid
  else if (!ObjectId.isValid(_queryId)) {
    return res.status(400).send({
      errorCode: 400,
      message: 'Given query ID must be a valid ID string.'
    });
  };

  // Ensuring the given user ID corresponds to a user
  // Update its last used property while checking
  return User.findOneAndUpdate({ _id: _userId }, { $set: { lastUsed: new Date() } }, { upsert: false })
  .then(function(user) {

    if (!user) {
      return res.status(404).send({
        errorCode: 404,
        message: 'Given user ID does not associate with any user in the database.'
      });
    };

    // Now load the given timestamp if it exists
    return Timestamp.findById(_queryId, { __v: 0 })
    .then(function(timestamp) {

      // Error if no timestamp exists
      if (!timestamp) {
        return res.status(404).send({
          errorCode: 404,
          message: 'Given timestamp ID does not associate with any Timestamp in the database.'
        }); 
      };

      res.status(200).send(timestamp);
    });
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

// Key required to use the API endpoint for flushing Timestamps below.
const FLUSH_SECRET_KEY = require('./flushKey');

/**
 * Removes all Timestamps that are more than 24 hours old
 */
function flushTimestamps(req, res) {

  const _secretKey = req.swagger.params.secretKey.value;

  if (_secretKey !== FLUSH_SECRET_KEY) {
    return res.status(403).send({
      errorCode: 403,
      message: 'Invalid secret key provided to use this API endpoint.'
    })
  };
  
  // A Day Ago = 24 Hours
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // Delete all timestamps created less than a day ago
  return Timestamp.deleteMany({ dateCreated: { $lt: yesterday } })
  .then(function(result) {
    console.log(result);

    // Show number of timestamps removed as result
    // e.g. { removedTimestamps: 1 }
    res.status(200).send({
      removedTimestamps: result.deletedCount
    });
  })
  .catch(function(err) {
    // Debug error if caused
    console.log(err);

    res.status(400).send(err);
  });
};

module.exports = {
  sendTimestamp: sendTimestamp,
  listTimestamps: listTimestamps,
  loadTimestamp: loadTimestamp,
  flushTimestamps: flushTimestamps
};