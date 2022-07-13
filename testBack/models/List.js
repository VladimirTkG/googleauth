const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const List = new Schema({
    listName: {
        type: String,
        // required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    leadsList: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Lead'
        }
    ],
    lastActivity: {
        type: String,
        default: 'Email compaign - In progress'
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
})

List.plugin(mongoosePaginate);

module.exports = model('List', List);