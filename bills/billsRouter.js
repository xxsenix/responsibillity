'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const {Bill} = require('./models');
const app = express.Router();

app.get('/', (req, res) => {
    Bill
     .find()
     .then(bills => {
         console.log(bills)
         res.json(bills.map(bill => bill.serialize()));
     })
     .catch(err => {
         console.error(err);
         res.status(500).json({error: 'Something went wrong'});
     });
});

app.post('/', jsonParser, (req, res) => {
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
        billWebsite: req.body.billWebsite
    })
    .then(bill => res.status(201).json(bill.serialize()))
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Something went wrong'})
    });
});

module.exports = app;