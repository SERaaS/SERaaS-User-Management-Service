'use strict';

// File for managing authentication requests for registration and login

const util = require('util'),
  bcrypt = require('bcrypt'),
  User = require('../models/User'),
  isValidObjectId = require('mongoose').Types.ObjectId.isValid;

/**
 * Registers a user account with the given account credentials
 */
function register(req, res) {
  const _user = req.swagger.params.user.value,
    { username, password } = _user;

  // Username string must not be empty
  if (username === '') {
    return res.status(400).send({
      errorCode: 400,
      message: 'Username cannot be an empty string for registration.'
    });
  }

  // Password string must not be empty
  else if (password === '') {
    return res.status(400).send({
      errorCode: 400,
      message: 'Password cannot be an empty string for registration.'
    });
  }

  // Password string must atleast be 7 characters long
  else if (password.length < 7) {
    return res.status(400).send({
      errorCode: 400,
      message: 'Password must atleast be 7 characters long.'
    });
  };

  return User.findOne({ name: username })
  .then(function(user) {

    // Username already used
    if (user) {
      return res.status(409).send({
        errorCode: 409,
        message: 'Username already being used.'
      });
    };

    bcrypt.hash(password, 10, function(err, hash) {
      if (err) {
        return res.status(400).send({
          errorCode: 400,
          message: err
        });
      };

      const newUser = new User({
        name: username,
        password: hash,
        dateCreated: new Date()
      });

      return newUser.save()
      .then(function(saved) {
        // console.log(saved);

        const result = {
          _id: saved._id,
          name: saved.name,
          dateCreated: saved.dateCreated,
          lastUsed: saved.lastUsed
        };

        res.status(200).send(result)
      })
    });
  })
  .catch(function(err) {
    console.log(err);

    res.status(400).send({
      errorCode: 400,
      message: err
    })
  })
}

function noUserFoundMessage(res) {
  return res.status(404).send({
    errorCode: 404,
    message: 'No user found with credentials.'
  });
}

/**
 * Authenticates the given user credentials
 */
function login(req, res) {
  const _user = req.swagger.params.user.value,
    { username, password } = _user;

  // Automatically fail if it does not pass the registration requirements by default
  if (username === '' || password === '' || password.length < 7) {
    return noUserFoundMessage(res);
  };

  // Checking if user exists in the database
  // Update its last used property while checking
  return User.findOneAndUpdate({ name: username }, { $set: { lastUsed: new Date() } }, { upsert: false, new: true })
  .then(function(user) {
    if (!user) {
      return noUserFoundMessage(res);
    };

    // Compare plaintext with hash to check if it's the equivalent password
    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return noUserFoundMessage(res);
    };

    const result = {
			_id: user._id,
			name: user.name,
			dateCreated: user.dateCreated,
			lastUsed: user.lastUsed
    };
  
		res.status(200).send(result);
  });
}

/**
 * Checks if the given user ID is associated with a registered account
 */
function validateUserId(req, res) {
  const _userId = req.swagger.params.userId.value;

  if (!isValidObjectId(_userId)) {
    return res.status(400).send({
      errorCode: 400,
      message: 'Given user ID must be a valid ID string.'
    });
  };

	// Checking if user exists in the database
  // Update its last used property while checking
	return User.findOneAndUpdate({ _id: _userId }, { $set: { lastUsed: new Date() } }, { upsert: false })
	.then(function(user) {
    res.status(200).send({ userExists: user != null });
  })
  .catch(function(err) {
    res.status(400).send({
      errorCode: 400,
      message: err
    });
  });
};

module.exports = {
  register: register,
  login: login,
  validateUserId: validateUserId
}