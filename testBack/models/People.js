const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const People = new Schema({
    companyName: {
        type: String,
        // required: true
    },
    linkedin: {
        type: String,
        // unique: true,
        // required: true
    },
    name: {
        type: String,
    },
    surname : {
        type: String,
    },
    // limitedPartners: {
    //     type: String,
    //     // required: true
    // },
    industry: {
        type: String,
    },
    subIndustry: {
        type: String,
    },
    email: {
        type: String,
        // required: true
    },
    slug: {
        type: String,
    },
    leadStatus: {
        type: String,
        enum: ['No action', 'Message Received', 'Message sent'],
        default: 'No action',
        // validate: {
        //     validator: value => value === 'No action' || value === 'Action Received' || value === 'Email sent',
        //     message: props => `${props.value} is invalid for Lead Status`,
        // },
    },
    notes: {
        type: String,
        // required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

People.plugin(mongoosePaginate);

module.exports = model('People', People);