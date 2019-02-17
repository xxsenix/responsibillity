'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');
const { User } = require('../users');
const { TEST_DATABASE_URL } = require('../config');

const expect = chai.expect;

chai.use(chaiHttp);

describe('/api/user', function () {
    const phoneNumber = '2141112345';
    const password = 'examplePass';
    const phoneNumberB = '4693569067';
    const passwordB = 'anotherExample';

    before(function () {
        return runServer(TEST_DATABASE_URL);
      });
    
      after(function () {
        return closeServer();
      });
    
      beforeEach(function () { });
    
      afterEach(function () {
        return User.deleteOne({});
      });

    describe('/api/users', function() {
        describe('POST', function() {
          it('Should reject users with missing phone number', function () {
            return chai
                .request(app)
                .post('/api/users')
                .send({
                    password
                })
                .then((res) =>{
                    expect(res).to.have.status(422);
                    expect(res.body.reason).to.equal('ValidationError');
                    expect(res.body.message).to.equal('Missing field');
                    expect(res.body.location).to.equal('phoneNumber');
                })
                .catch(err => {
                    if (err) {
                        throw err;
                    }
                });
            });
            it('Should reject users with missing password', function () {
                return chai
                    .request(app)
                    .post('/api/users')
                    .send({
                        phoneNumber
                    })
                    .then((res) =>{
                        expect(res).to.have.status(422);
                        expect(res.body.reason).to.equal('ValidationError');
                        expect(res.body.message).to.equal('Missing field');
                        expect(res.body.location).to.equal('password');
                    })
                    .catch(err => {
                        if (err) {
                            throw err;
                        }
                    });
            });
            it('Should reject users with non-string password', function () {
                return chai
                  .request(app)
                  .post('/api/users')
                  .send({
                    phoneNumber,
                    password: 1234,
                  })
                  .then((res) => {
                    expect(res).to.have.status(422);
                    expect(res.body.reason).to.equal('ValidationError');
                    expect(res.body.message).to.equal(
                      'Incorrect field type: expected string'
                    );
                    expect(res.body.location).to.equal('password');
                  })
                  .catch(err => {
                    if (err) {
                      throw err;
                    }
                  });
            });
            it('Should reject users with non-trimmed password', function () {
                return chai
                  .request(app)
                  .post('/api/users')
                  .send({
                    phoneNumber,
                    password: ` ${password} `,
                  })
                  .then((res) => {
                    expect(res).to.have.status(422);
                    expect(res.body.reason).to.equal('ValidationError');
                    expect(res.body.message).to.equal(
                      'Cannot start or end with whitespace'
                    );
                    expect(res.body.location).to.equal('password');
                  })
                  .catch(err => {
                    if (err) {
                      throw err;
                    }
                  });
            });
        });
    });
});
