'use strict';

// File for managing authentication requests for registration and login

const util = require('util'),
    bcrypt = require('bcrypt'),
    User = require('../models/User'),
    isValidObjectId = require('mongoose').Types.ObjectId.isValid

// Registers a user account with the given account credentials
function register(req, res) {
    const _user = req.swagger.params.user.value,
        { username, password } = _user;

    // Username string must not be empty
    if (username === '') {
        return res.status(400).send({
            statusCode: 400,
            message: 'Username cannot be an empty string for registration.'
        });
    }

    // Password string must not be empty
    else if (password === '') {
        return res.status(400).send({
            statusCode: 400,
            message: 'Password cannot be an empty string for registration.'
        });
    }

    // Password string must atleast be 7 characters long
    else if (password.length < 7) {
        return res.status(400).send({
            statusCode: 400,
            message: 'Password must atleast be 7 characters long.'
        });
    };

    return User.findOne({ name: username })
    .then(function(user) {

        // Username already used
        if (user) {
            return res.status(409).send({
                statusCode: 409,
                message: 'Username already being used.'
            });
        };

        bcrypt.hash(password, 10, function(err, hash) {
            if (err) {
                return res.status(400).send({
                    statusCode: 400,
                    message: err
                });
            };

            const newUser = new User({
                name: username,
                password: hash
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
            statusCode: 400,
            message: err
        })
    })
}

function noUserFoundMessage(res) {
    return res.status(404).send({
        statusCode: 404,
        message: 'No user found with credentials.'
    });
}

// Authenticates the given user credentials
function login(req, res) {
    const _user = req.swagger.params.user.value,
        { username, password } = _user;

    // Automatically fail if it does not pass the registration requirements by default
    if (username === '' || password === '' || password.length < 7) {
        return noUserFoundMessage(res);
    };

    return User.findOne({ name: username })
    .then(function(user) {
        if (!user) {
            return noUserFoundMessage(res);
        };

        // Compare plaintext with hash to check if it's the equivalent password
        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) {
            return noUserFoundMessage(res);
        };

        // Track last used date before outputting
        return User.findOneAndUpdate({ name: username }, { $set: { lastUsed: new Date() } }, { new: true })
        .then(function(updated) {
            const result = {
                _id: updated._id,
                name: updated.name,
                dateCreated: updated.dateCreated,
                lastUsed: updated.lastUsed
            };
    
            res.status(200).send(result);
        })
    });
}

// Checks if the given user id is associated with a registered account
function validateUserId(req, res) {
    const _userId = req.swagger.params.userId.value;

    if (!isValidObjectId(_userId)) {
        return res.status(400).send({
            errorCode: 400,
            message: 'Given user ID must be a valid id string.'
        });
    };

    return User.findById(_userId)
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