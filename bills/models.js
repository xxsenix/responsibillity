'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const billSchema = mongoose.Schema({
    billName: {type: String, required: true},
    dueDate: {type: String, required: true},
    amount: {type: Number, required: true},
    billWebsite: {type: String, required: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

billSchema.methods.serialize = function() {
    return {
        id: this._id,
        billName: this.billName,
        dueDate: this.dueDate,
        amount: this.amount,
        billWebsite: this.billWebsite
    };
};

const Bill = mongoose.model('Bill', billSchema);

module.exports = {Bill};