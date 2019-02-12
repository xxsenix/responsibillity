'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const {Bill} = require('./models');
const passport = require('passport');
const app = express.Router();
const jwtAuth = passport.authenticate('jwt', { session: false });

app.get('/', jwtAuth, (req, res) => {
    Bill
     .find()
     .then(bills => {
         res.json(bills.map(bill => bill.serialize()));
     })
     .catch(err => {
         console.error(err);
         res.status(500).json({error: 'Something went wrong'});
     });
});

app.get('/:id', jwtAuth, (req, res) => {
    Bill
     .findById(req.params.id)
     .then(bills => res.json(bills.serialize()))
     .catch(err => {
        console.log(err);
        res.status(500).json({error: 'something went horribly wrong'});
     });
});

app.post('/', jwtAuth, jsonParser, (req, res) => {
   const requiredFields = ['billName', 'dueDate', 'amount', 'billWebsite'];
   for (let i = 0; i < requiredFields.length; i++) {
       const field = requiredFields[i];
       if (!(field in req.body)) {
           const message = `Missing \`${field}\` in request body`;
           console.error(message);
           return res.status(400).send(message)
       }
   }

   Bill
    .create({
        billName: req.body.billName,
        dueDate: req.body.dueDate,
        amount: req.body.amount,
        billWebsite: req.body.billWebsite,
        user: req.user.id
    })
    .then(bill => res.status(201).json(bill.serialize()))
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Something went wrong'})
    });
});

app.delete('/:id', jwtAuth, (req, res) => {
    Bill
    .findByIdAndRemove(req.params.id)
    .then(() => {
      console.log(`Deleted bill with id \`${req.params.id}\``);
      res.status(204).end();  
    })
    .catch(err => res.status(500).json({ message: 'Something went wrong' }));
});

app.put('/:id', jwtAuth, jsonParser, (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        res.status(500).json({
            message: 'Request path id and request body id values must match'    
        });
    }

    const updated = {};
    const updateableFields = ['billName', 'dueDate', 'amount', 'billWebsite'];
    updateableFields.forEach(field => {
        if (field in req.body) {
          updated[field] = req.body[field];
        }
    });
    
    Bill
        .findOneAndUpdate(req.params.id, { $set: updated }, { new: true }) 
        .then(bill => res.status(204).end())
        .catch(err => res.status(500).json({ message: 'Something went wrong' }));
});

module.exports = app;