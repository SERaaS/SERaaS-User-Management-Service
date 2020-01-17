'use strict';

var SwaggerExpress = require('swagger-express-mw');
var app = require('express')();
module.exports = app; // for testing

var config = {
  appRoot: __dirname // required config
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  var port = process.env.PORT || 10010;
  app.listen(port);

  if (swaggerExpress.runner.swagger.paths['/authentication']) {
    console.log('try this:\ncurl http://127.0.0.1:' + port + '/authentication?name=Scott');
  }
});

// Using Mongoose to blackbox the MongoDB connectivity
const secretURI = require('./mongodb-connectivity-uri');
const mongoose = require('mongoose');
mongoose.connect(secretURI, { useNewUrlParser: true });

const db = mongoose.connection;
db.on('error', (err) => console.log(`Connection error:\n${err}`));
db.once('open', () => console.log(`Connected to ${db.name}.`));