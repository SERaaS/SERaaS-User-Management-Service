var should = require('should');
var request = require('supertest');
var server = require('../../../app');

describe('controllers', function() {

  describe('authentication', function() {

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

    describe('POST /authentication/register', function() {
      it('should be able to register a user account from username and password input', function(done) {
        done();
      });

      it('should give error if username is just empty string', function(done) {
        done();
      });

      it('should give error if no username was provided', function(done) {
        done();
      });

      it('should give error if password is less than seven characters', function(done) {
        done();
      });

      it('should give error if password is just empty string', function(done) {
        done();
      });

      it('should give error if no password was provided', function(done) {
        done();
      });
    })

  });

});
