const {Schema, model} = require("mongoose");

const AccessCheck = new Schema ({
    check: {
        type: Boolean,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
})

module.exports = model('AccessCheck', AccessCheck);