const should = require('should'),
    request = require('supertest'),
    server = require('../../../app'),
    User = require('../../../api/models/User');

describe('controllers', function() {

  describe('authentication', function() {

    /*
    describe('GET /authentication', function() {

      it('should return a default string', function(done) {

        request(server)
          .get('/authentication')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);

            res.body.should.eql('Hello, stranger!');

            done();
          });
      });

      it('should accept a name parameter', function(done) {

        request(server)
          .get('/authentication')
          .query({ name: 'Scott'})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);

            res.body.should.eql('Hello, Scott!');

            done();
          });
      });
    });
    */

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

  });

});
