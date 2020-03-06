const should = require('should'),
  request = require('supertest'),
  server = require('../../../app'),
  User = require('../../../api/models/User'),
  Timestamp = require('../../../api/models/Timestamp'),

  // Used to construct a random ObjectID to validate user ID related API endpoints
  ObjectId = require('mongoose').Types.ObjectId;

describe('controllers', function() {

  describe('timestamp', function() {

    describe('POST /authentication/data/{userId}', function() {
      
      const _userCredentials = { username: 'SERaaS4', password: 'MyPassword' };

      // Storing the user ID of the created user to test the endpoint
      let _userId = '';

      // A valid input for the POST call
      const _validInput = {
        fileName: 'myFakeAudioFile.wav',
        paramEmotionsAvailable: ['happy'],
        paramPeriodicQuery: 2,
        output: [
          {
            emotion: 'happy',
            probability: 0.72135554771,
            duration: { from: '00:00', to: '00:01' }
          },

          {
            emotion: 'happy',
            probability: 0.713238514345,
            duration: { from: '00:01', to: '00:02' }
          },
        ]
      };
      
      // Add a user account before all of the tests
      before(function(done) {
        return request(server)
          .post('/authentication/register')
          .send(_userCredentials)
          .end(function(err, res) {
            _userId = res.body._id;
            done();
          });
      });

      // Remove the created timestamp after each test
      afterEach(function(done) {
        return Timestamp.deleteOne({ userId: _userId })
        .then(function() {
          done();
        });
      });

      // Remove the user account after all of the tests
      after(function(done) {
        return User.deleteOne({ name: _userCredentials.username })
        .then(function() {
          done();
        });
      });

      it('should be able to send SERaaS API query data if user exists', function(done) {
        request(server)
          .post(`/authentication/data/${_userId}`)
          .send(_validInput)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should be able to send SERaaS API query data without emotions availability data', function(done) {
        let validInput = Object.assign({}, _validInput);
        delete validInput.paramEmotionsAvailable;
        
        request(server)
          .post(`/authentication/data/${_userId}`)
          .send(validInput)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should be able to send SERaaS API query data without periodic query data', function(done) {
        let validInput = Object.assign({}, _validInput);
        delete validInput.paramPeriodicQuery;
        
        request(server)
          .post(`/authentication/data/${_userId}`)
          .send(validInput)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {            
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should give error if no file name given in input', function(done) {
        let invalidInput = Object.assign({}, _validInput);
        delete invalidInput.fileName;
        
        request(server)
          .post(`/authentication/data/${_userId}`)
          .send(invalidInput)
          .expect('Content-Type', /json/)
          .expect(400)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should give error if no resulting output value given in input', function(done) {
        let invalidInput = Object.assign({}, _validInput);
        delete invalidInput.output;
        
        request(server)
          .post(`/authentication/data/${_userId}`)
          .send(invalidInput)
          .expect('Content-Type', /json/)
          .expect(400)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should give error if no user exists with given user ID', function(done) {
        request(server)
          .post(`/authentication/data/${new ObjectId()}`)
          .send(_validInput)
          .expect('Content-Type', /json/)
          .expect(404)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should give error if given user ID is invalid string', function(done) {
        request(server)
          .post(`/authentication/data/fisken`)
          .send(_validInput)
          .expect('Content-Type', /json/)
          .expect(400)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should give error if no user ID given', function(done) {
        request(server)
          .post(`/authentication/data/`)
          .send(_validInput)
          .expect(404)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });
    });

    describe('GET /authentication/data/{userId}', function() {

      const _userCredentials = { username: 'SERaaS5', password: 'MyPassword' };

      // Storing the user ID of the created user to test the endpoint
      let _userId = '';

      // Add a user account and 2 timestamps before all of the tests
      before(function(done) {
        return request(server)
          .post('/authentication/register')
          .send(_userCredentials)
          .end(function(err, res) {
            _userId = res.body._id;
            
            return request(server)
              .post(`/authentication/data/${_userId}`)
              .send({
                fileName: 'myFakeAudioFile.wav',
                output: [{ emotion: 'happy', probability: 0.72135554771 }]
              })
              .end(function(err, res) {

                return request(server)
                .post(`/authentication/data/${_userId}`)
                .send({
                  fileName: 'myFakeAudioFile2.wav',
                  output: [{ emotion: 'sad', probability: 0.4538557138 }]
                })
                .end(function(err, res) {
                  done();
                })
              })
          });
      });

      // Remove the user account and its timestamps after all of the tests
      after(function(done) {
        return Timestamp.deleteMany({ userId: _userId })
        .then(function() {

          return User.deleteOne({ name: _userCredentials.username })
          .then(function() {
            done();
          });
        });
      });

      it('should be able to list all of the SERaaS API queries for a user', function(done) {
        request(server)
          .get(`/authentication/data/${_userId}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should give error if no user exists with given user ID', function(done) {
        request(server)
          .get(`/authentication/data/${new ObjectId()}`)
          .expect('Content-Type', /json/)
          .expect(404)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should give error if given user ID is invalid string', function(done) {
        request(server)
          .get(`/authentication/data/maten`)
          .expect('Content-Type', /json/)
          .expect(400)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should give error if no user ID given', function(done) {
        request(server)
          .get(`/authentication/data/`)
          .expect(404)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });
    });

    describe('GET /authentication/data/{userId}/{queryId}', function() {

      const _userCredentials = { username: 'SERaaS6', password: 'MyPassword' };

      // Storing the user and query ID of the created user/timestamp to test the endpoint
      let _userId = '',
      _queryId = '';

      // Add a user account and a timestamp before all of the tests
      before(function(done) {
        return request(server)
          .post('/authentication/register')
          .send(_userCredentials)
          .end(function(err, res) {
            _userId = res.body._id;
            
            return request(server)
              .post(`/authentication/data/${_userId}`)
              .send({
                fileName: 'myFakeAudioFile.wav',
                output: [{ emotion: 'happy', probability: 0.72135554771 }]
              })
              .end(function(err, res) {
                _queryId = res.body._id;

                done();
              })
          });
      });

      // Remove the user account and its timestamps after all of the tests
      after(function(done) {
        return Timestamp.deleteMany({ userId: _userId })
        .then(function() {

          return User.deleteOne({ name: _userCredentials.username })
          .then(function() {
            done();
          });
        });
      });

      it('should be able to load the SERaaS Query for the user', function(done) {
        request(server)
          .get(`/authentication/data/${_userId}/${_queryId}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should give error if no user exists with given user ID', function(done) {
        request(server)
          .get(`/authentication/data/${new ObjectId()}/${_queryId}`)
          .expect('Content-Type', /json/)
          .expect(404)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should give error if given user ID is invalid string', function(done) {
        request(server)
          .get(`/authentication/data/mannen/${_queryId}`)
          .expect('Content-Type', /json/)
          .expect(400)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });
      
      it('should give error if no user ID given', function(done) {
        request(server)
          .get(`/authentication/data//${_queryId}`)
          .expect(404)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should give error if no query exist with given query ID', function(done) {
        request(server)
          .get(`/authentication/data/${_userId}/${new ObjectId()}`)
          .expect('Content-Type', /json/)
          .expect(404)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should give error if given query ID is invalid string', function(done) {
        request(server)
          .get(`/authentication/data/${_userId}/kvinnen`)
          .expect('Content-Type', /json/)
          .expect(400)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });
    });
  });
});