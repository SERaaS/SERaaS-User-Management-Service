const should = require('should'),
    request = require('supertest'),
    server = require('../../../app'),
    User = require('../../../api/models/User'),
    Timestamp = require('../../../api/models/Timestamp'),

    // Used to construct a random ObjectID to validate user ID related API endpoints
    ObjectId = require('mongoose').Types.ObjectId

describe('controllers', function() {

  describe('authentication', function() {

    describe('POST /authentication/register', function() {

      const _userCredentials = { username: 'SERaaS', password: 'MyPassword' };

      // Remove database contents after each query
      before(function(done) {
        return User.deleteOne({ name: _userCredentials.username })
        .then(function() {
          done();
        })
      })

      afterEach(function(done) {
        return User.deleteOne({ name: _userCredentials.username })
        .then(function() {
          done();
        })
      })

      // Test cases
      it('should be able to register a user account from username and password input', function(done) {
        request(server)
          .post('/authentication/register')
          .send(_userCredentials)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should give error if username already being used', function(done) {
        request(server)
          .post('/authentication/register')
          .send(_userCredentials)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {

            request(server)
            .post('/authentication/register')
            .send(_userCredentials)
            .expect('Content-Type', /json/)
            .expect(409)
            .end(function(err, res) {
              if (err) { done(new Error(err)); }
              else { done(); }
            });
          });
      });

      it('should give error if username is just empty string', function(done) {
        request(server)
          .post('/authentication/register')
          .send({ username: '', password: _userCredentials.password })
          .expect('Content-Type', /json/)
          .expect(400)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should give error if no username was provided', function(done) {
        request(server)
          .post('/authentication/register')
          .send({ password: _userCredentials.password })
          .expect('Content-Type', /json/)
          .expect(400)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should give error if password is less than seven characters', function(done) {
        request(server)
          .post('/authentication/register')
          .send({ username: _userCredentials.username, password: 'beep' })
          .expect('Content-Type', /json/)
          .expect(400)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should give error if password is just empty string', function(done) {
        request(server)
          .post('/authentication/register')
          .send({ username: _userCredentials.username, password: '' })
          .expect('Content-Type', /json/)
          .expect(400)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should give error if no password was provided', function(done) {
        request(server)
          .post('/authentication/register')
          .send({ username: _userCredentials.username })
          .expect('Content-Type', /json/)
          .expect(400)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });
    })

    describe('POST /authentication/login', function() {

      const _userCredentials = { username: 'SERaaS2', password: 'MyPassword' };
      
      // Add a user account before all of the tests
      before(function(done) {
        return request(server)
        .post('/authentication/register')
        .send(_userCredentials)
        .end(function(err, res) {
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

      // Test cases
      it('should be able to authenticate an user account from username and password input', function(done) {
        request(server)
          .post('/authentication/login')
          .send(_userCredentials)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should give error if no user account from username and password input exists', function() {
        request(server)
          .post('/authentication/login')
          .send({ username: 'beep', password: 'boop' })
          .expect('Content-Type', /json/)
          .expect(404)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should give error if no username was provided', function(done) {
        request(server)
          .post('/authentication/login')
          .send({ password: _userCredentials.password })
          .expect('Content-Type', /json/)
          .expect(400)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should give error if no password was provided', function(done) {
        request(server)
          .post('/authentication/login')
          .send({ username: _userCredentials.username })
          .expect('Content-Type', /json/)
          .expect(400)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });
    });

    describe('GET /authentication/validate/{userId}', function() {

      const _userCredentials = { username: 'SERaaS3', password: 'MyPassword' };
      
      // Storing the user ID of the created user to test the endpoint
      let _userId = '';
      
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

      // Remove the user account after all of the tests
      after(function(done) {
        return User.deleteOne({ name: _userCredentials.username })
        .then(function() {
          done();
        });
      });

      it('should give true if user exists in the database', function(done) {
        request(server)
          .get(`/authentication/validate/${_userId}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else {
              res.body.userExists.should.equal(true);
              done();
            }
          });
      });

      it('should give false if user does not exist in the database', function(done) {
        request(server)
          .get(`/authentication/validate/${new ObjectId()}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else {
              res.body.userExists.should.equal(false);
              done();
            }
          });
      });

      it('should give error if user ID provided is not an appropriate string', function(done) {
        request(server)
          .get(`/authentication/validate/kyllingen`)
          .expect('Content-Type', /json/)
          .expect(400)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });

      it('should give error if no user ID provided to path', function(done) {
        request(server)
          .get(`/authentication/validate/`)
          .expect(404)
          .end(function(err, res) {
            if (err) { done(new Error(err)); }
            else { done(); }
          });
      });
    });

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
  });

});
