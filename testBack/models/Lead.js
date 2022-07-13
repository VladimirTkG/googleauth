const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const Lead = new Schema({
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
    slug:{
        type: String,
    },
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
    leadStatus: {
        type: String,
        enum: ['No action', 'Message Received', 'Message sent'],
        default: 'No action',
        validate: {
            validator: value => value === 'No action' || value === 'Message Received' || value === 'Message sent',
            message: props => `${props.value} is invalid for Lead Status`,
        },
    },
    notes: {
        type: String,
        // required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    leadStatusForUser: {
        type: Object,
        default: {},
    },
    unread: [{
        type: String,
        ref: 'User'
    }],
    unreadId: [{
        type: String
    }],
    owners: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
})

Lead.plugin(mongoosePaginate);

module.exports = model('Lead', Lead);