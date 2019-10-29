require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express');
const router = express.Router();

//___________SCHEMA TYPE DE LOBJET______________________________________________________________________
const benchSchema = new mongoose.Schema({
    titre: {
        type: String,
        minlength: 3,
        required: true
    },
    resultat: {
        type: String,
        minlength: 2,
        required: true
    },
    cat: {
        type: String,
        minlength: 3,
        required: true
    },
    date: Date,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});
//_____________REFORMATAGE DE LA REPONSE !_______________________________________________________________
benchSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id;
        delete returnedObject.__v
    }
});
//_______________________________________________________________________________________________________
module.exports = mongoose.model('Bench', benchSchema);
