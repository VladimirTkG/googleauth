const mongoose = require('mongoose');
const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const User = new Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    id: {
        type: String,
    },
    family_name: {
        type: String,
    },
    given_name: {
        type: String,
    },
    name: {
        type: String,
    },
    picture: {
        type: String,
    },
    verified_email: {
        type: Boolean,
    }
})

User.plugin(mongoosePaginate);

module.exports = model('User', User);