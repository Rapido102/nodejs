require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express');
const router = express.Router();

//___________SCHEMA TYPE DE LOBJET______________________________________________________________________
const noteSchema = new mongoose.Schema({
    content: {
        type: String,
        minlength: 5,
        required: true
    },
    date: Date,
    important: Boolean,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});
//_____________REFORMATAGE DE LA REPONSE !_______________________________________________________________
noteSchema.set('toJSON', {
    transform: (document, returnedObject) => {
       returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id;
       delete returnedObject.__v
    }
});
//_______________________________________________________________________________________________________
module.exports = mongoose.model('Note', noteSchema);
