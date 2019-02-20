'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const {User} = require('./models');

const router = express.Router();

const jsonParser = bodyParser.json();

// Post to register a new user
router.post('/', jsonParser, (req, res) => {

    const requiredFields = ['phoneNumber', 'password'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField) {
      return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: 'Missing field',
        location: missingField
      });
    }

    const numField = 'phoneNumber';
    const nonNumField = numField in req.body && typeof req.body[numField] !== 'number';
   
    if (nonNumField) {
        console.log(nonNumField);
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Phone # must be 10 digits exactly',
            location: numField      
        });
    }

    const stringField = 'password';
    const nonStringField = stringField in req.body && typeof req.body[stringField] !== 'string';
   
    if (nonStringField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Incorrect field type: expected string',
            location: stringField        
        });
    }

    const explicitlyTrimmedField = 'password';
    const nonTrimmedField = req.body[explicitlyTrimmedField].trim() !== req.body[explicitlyTrimmedField];

    if(nonTrimmedField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Cannot start or end with whitespace',
            location: explicitlyTrimmedField
        });        
    }

    const sizedFields = {
        phoneNumber: {
            num: 10
        },
        password: {
            min: 8,
            max: 72
        }
    };

    const notEnoughDigits = Object.keys(sizedFields).find(
        field =>
          'num' in sizedFields[field] &&
                req.body[field].toString().length !== sizedFields[field].num 
    );  

    const tooSmallField = Object.keys(sizedFields).find(
        field =>
          'min' in sizedFields[field] &&
                req.body[field].trim().length < sizedFields[field].min
    );

    const tooLargeField = Object.keys(sizedFields).find(
        field =>
          'max' in sizedFields[field] &&
                req.body[field].trim().length > sizedFields[field].max
    );

    if (notEnoughDigits) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: `Phone # must be ${sizedFields[notEnoughDigits].num} digits long`,
            location: notEnoughDigits
        });
    }

    if (tooSmallField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: `Password must be at least ${sizedFields[tooSmallField].min} characters long`,
            location: tooSmallField
        });
    }

    if (tooLargeField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: `Password must be at most ${sizedFields[tooLargeField].max} characters long`,
            location: tooLargeField
        });
    }

    let {phoneNumber, password} = req.body;

    return User.find({phoneNumber})
        .count()
        .then(count => {
            if (count > 0) {
                return Promise.reject({
                    code: 422,
                    reason: 'ValidationError',
                    message: 'Phone number already taken',
                    location: 'phoneNumber'
                });
            }
            return User.hashPassword(password);
        })
        .then(hash => {
            return User.create({
               phoneNumber,
               password: hash 
            });
        })
        .then(user => {
            return res.status(201).json(user.serialize());
        })
        .catch(err => {
            if (err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({code: 500, message: 'Internal server error'});
        });
});

router.get('/', (req, res) => {
    return User.find()
      .then(users => res.json(users.map(user => user.serialize())))
      .catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = {router};