'use strict';

const SwaggerExpress = require('swagger-express-mw'),
  app = require('express')(),
  cors = require('cors');

app.use(cors());

module.exports = app; // for testing

const config = {
  appRoot: __dirname // required config
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  const port = process.env.PORT || 4000;
  app.listen(port);
});

// Using Mongoose to blackbox the MongoDB connectivity
const secretURI = require('./mongodb-connectivity-uri');
const mongoose = require('mongoose');

mongoose.connect(secretURI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

const db = mongoose.connection;
db.on('error', (err) => console.log(`Connection error:\n${err}`));
db.once('open', () => console.log(`Connected to ${db.name}.`));