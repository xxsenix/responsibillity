'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const { app, runServer, closeServer } = require('../server');
const { User } = require('../users');
const { JWT_SECRET, TEST_DATABASE_URL } = require('../config');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Auth endpoints', function () {
  const phoneNumber = '1234567890';
  const password = 'examplePass';

  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  after(function () {
    return closeServer();
  });

  beforeEach(function () {
    return User.hashPassword(password).then(password =>
      User.create({
        phoneNumber,
        password
      })
    );
  });

  afterEach(function () {
    return User.deleteMany({});
  });

  describe('/api/auth/login', function () {
    it('Should reject requests with no credentials', function () {
      return chai
        .request(app)
        .post('/api/auth/login')
        .then((res) =>
            expect(res).to.have.status(400)
        )
        .catch(err => {
          if (err) {
            throw err;
          }      
        });
    });

    it('Should reject requests with incorrect phone numbers', function () {
      return chai
        .request(app)
        .post('/api/auth/login')
        .send({ phoneNumber: 1111111111, password })
        .then((res) =>
            expect(res).to.have.status(401)
        )
        .catch(err => {
          if (err) {
            throw err;
          }
        });
    });

    it('Should reject requests with incorrect passwords', function () {
      return chai
        .request(app)
        .post('/api/auth/login')
        .send({ phoneNumber, password: 'wrongPassword' })
        .then((res) =>
            expect(res).to.have.status(401)
        )
        .catch(err => {
          if (err) {
            throw err;
          }
        });
    });

    it('Should return a valid auth token', function () {
      return chai
        .request(app)
        .post('/api/auth/login')
        .send({ phoneNumber, password })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          const token = res.body.authToken;
          expect(token).to.be.a('string');
          const payload = jwt.verify(token, JWT_SECRET, {
            algorithm: ['HS256']
          });
          expect(payload.user).to.deep.equal({
            phoneNumber
          });
        });
    });
  });

  describe('/api/auth/refresh', function () {
    it('Should reject requests with no credentials', function () {
      return chai
        .request(app)
        .post('/api/auth/refresh')
        .then((res) =>
            expect(res).to.have.status(401)
        )
        .catch(err => {
          if (err) {
            throw err;
          }
        });
    });
    it('Should reject requests with an invalid token', function () {
      const token = jwt.sign(
        {
          phoneNumber
        },
        'wrongSecret',
        {
          algorithm: 'HS256',
          expiresIn: '7d'
        }
      );

      return chai
        .request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .then((res) =>
            expect(res).to.have.status(401)
        )
        .catch(err => {
          if (err) {
            throw err;
          }
        });
    });
    it('Should reject requests with an expired token', function () {
      const token = jwt.sign(
        {
          user: {
            phoneNumber
          },
          exp: Math.floor(Date.now() / 1000) - 10 // Expired ten seconds ago
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: phoneNumber
        }
      );

      return chai
        .request(app)
        .post('/api/auth/refresh')
        .set('authorization', `Bearer ${token}`)
        .then((res) =>
            expect(res).to.have.status(401)
        )
        .catch(err => {
          if (err) {
            throw err;
          }
        });
    });
    it('Should return a valid auth token with a newer expiry date', function () {
      const token = jwt.sign(
        {
          user: {
            phoneNumber
          }
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: phoneNumber,
          expiresIn: '7d'
        }
      );
      const decoded = jwt.decode(token);

      return chai
        .request(app)
        .post('/api/auth/refresh')
        .set('authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          const token = res.body.authToken;
          expect(token).to.be.a('string');
          const payload = jwt.verify(token, JWT_SECRET, {
            algorithm: ['HS256']
          });
          expect(payload.user).to.deep.equal({
            phoneNumber
          });
          expect(payload.exp).to.be.at.least(decoded.exp);
        });
    });
  });
});
