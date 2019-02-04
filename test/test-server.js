'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server.js');

const expect = chai.expect;

chai.use(chaiHttp);

describe('index page', function() {
    it('should exist', function() {
        return chai
            .request(app)
            .get('/')
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
