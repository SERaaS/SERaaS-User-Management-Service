'use strict';

// File for managing authentication requests for registration and login

const util = require('util'),
    bcrypt = require('bcrypt'),
    User = require('../models/User');

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

function login(req, res) {
    // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
    const name = req.swagger.params.name.value || 'stranger';
    const hello = util.format('Hello, %s!', name);

    // this sends back a JSON response which is a single string
    res.json(hello);
}

module.exports = {
    register: register,
    login: login
}