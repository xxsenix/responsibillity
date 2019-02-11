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

    const stringField = 'password';
    const nonStringField = stringField in req.body && typeof req.body[stringField] !== 'string';
   
    if (nonStringField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Incorrect field type: expected string',
            location: nonStringField        
        });
    }

    const explicitlyTrimmedField = 'password';
    const nonTrimmedField = req.body[explicitlyTrimmedField].trim() !== req.body[explicitlyTrimmedField];

    if(nonTrimmedField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Cannot start or end with whitespace',
            location: nonTrimmedField
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

    // const notEqualField = Object.keys(sizedFields).find(
    //     field =>
    //       'num' in sizedFields[field] &&
    //             req.body[field].trim().length !== sizedFields[field].min
    // );

    const tooSmallField = Object.keys(sizedFields).find(
        field =>
          'min' in sizedFields[field] &&
                req.body[field].trim().length < sizedFields[field].min
    );

    const tooLargeField = Object.keys(sizedFields).find(
        field =>
          'max' in sizedFields[field] &&
                req.body[field].trim().length > sizedFields[field].min
    );

    // if (notEqualField) {
    //     return res.status(422).json({
    //         code: 422,
    //         reason: 'ValidationError',
    //         message: `Must be exactly ${sizedFields[notEqualField].num} digits long`,
    //         location: notEqualField
    //     });
    // }

    if (tooSmallField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: `Must be at least ${sizedFields[tooSmallField].min} characters long`,
            location: tooSmallField
        });
    }

    if (tooLargeField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: `Must be at most ${sizedFields[tooLargeField].max} characters long`,
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