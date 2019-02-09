'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const { app, runServer, closeServer } = require('../server.js');
const { TEST_DATABASE_URL } = require('../config');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Protected endpoint', function() {
    
    before(function () {
        return runServer(TEST_DATABASE_URL);
      });
    
      after(function () {
        return closeServer();
      });
    
    describe('index page', function() {
        it('should exist', function() {
            return chai
                .request(app)
                .get('/index.html')
                .then(function(res) {
                    expect(res).to.have.status(200);
                });
        });
    });
    
    describe('login page', function() {
        it('should exist', function() {
            return chai
                .request(app)
                .get('/login.html')
                .then(function(res) {
                    expect(res).to.have.status(200);
                });
        });
    });
    
    describe('signup page', function() {
        it('should exist', function() {
            return chai
                .request(app)
                .get('/signup.html')
                .then(function(res) {
                    expect(res).to.have.status(200);
                });
        });
    });
    
    describe('dashboard page', function() {
        it('should exist', function() {
            return chai
                .request(app)
                .get('/dashboard.html')
                .then(function(res) {
                    expect(res).to.have.status(200);
                });
        });
    });    
});
