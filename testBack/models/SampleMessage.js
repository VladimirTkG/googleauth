const { Schema, model } = require("mongoose");

const SampleMessage = new Schema({
    templateName: {
        type: String,
        required: true
    },
    themeMessage: {
        type: String,
        required: true
    },
    textMessage: {
        type: String,
        required: true
    },
    chosenMessage: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
})

module.exports = model('SampleMessage', SampleMessage);