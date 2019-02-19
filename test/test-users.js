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

    before(function () {
        return runServer(TEST_DATABASE_URL);
      });
    
      after(function () {
        return closeServer();
      });
    
      beforeEach(function () { });
    
      afterEach(function () {
        return User.deleteMany({});
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
            it('Should reject users with password less than eight characters', function () {
                return chai
                  .request(app)
                  .post('/api/users')
                  .send({
                    phoneNumber,
                    password: 'testtes',
                  })
                  .then((res) => {
                    expect(res).to.have.status(422);
                    expect(res.body.reason).to.equal('ValidationError');
                    expect(res.body.message).to.equal(
                      'Must be at least 8 characters long'
                    );
                    expect(res.body.location).to.equal('password');
                  })
                  .catch(err => {
                    if (err) {
                      throw err;
                    }
                });
            });
            it('Should reject users with password greater than 72 characters', function () {
                return chai
                  .request(app)
                  .post('/api/users')
                  .send({
                    phoneNumber,
                    password: new Array(73).fill('a').join('')
                  })
                  .then((res) => {
                    expect(res).to.have.status(422);
                    expect(res.body.reason).to.equal('ValidationError');
                    expect(res.body.message).to.equal(
                      'Must be at most 72 characters long'
                    );
                    expect(res.body.location).to.equal('password');
                  })
                  .catch(err => {
                    if (err) {
                      throw err;
                    }
                });
            });
            it('Should reject users with duplicate phone numbers', function () {
                // Create initial user
                return User.create({
                    phoneNumber,
                    password
                })
                .then(() => {
                    // Try creating user with same info
                   chai
                    .request(app)
                    .post('/api/users')
                    .send({
                      phoneNumber,
                      password
                    })
                    .then((res) => {
                      expect(res).to.have.status(422);
                      expect(res.body.reason).to.equal('ValidationError');
                      expect(res.body.message).to.equal(
                        'Phone number already taken'
                      );
                      expect(res.body.location).to.equal('phoneNumber');
                    })
                    .catch(err => {
                      if (err) {
                        throw err;
                      }
                    })
                });
            });

            it('Should create a new user', function () {
                return chai
                  .request(app)
                  .post('/api/users')
                  .send({
                    phoneNumber,
                    password
                  })
                  .then(res => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.keys(
                      'phoneNumber'
                    );
                    expect(res.body.phoneNumber).to.equal(phoneNumber);
                    return User.findOne({
                        phoneNumber
                    });
                  })
                  .then(user => {
                    expect(user).to.not.be.null;
                    return user.validatePassword(password);
                  })
                  .then(passwordIsCorrect => {
                    expect(passwordIsCorrect).to.be.true;
                  });
            });    
        });    
    });
});
