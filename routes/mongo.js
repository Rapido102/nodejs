const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');


/*if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]*/

const url =
    `mongodb://localhost:27017/notes`;
console.log('====API====')
mongoose.connect(url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})
    .then(() => {
        console.log('====connexion à mongoDB réussie====')
    });

const noteSchema = new mongoose.Schema({
    content: {
        type: String,
        minlength: 5,
        required: true
    }, date: {
        type: Date,
        required: true
    },
    important: Boolean
});
const Note = mongoose.model('Note', noteSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
}));

router.post('/notes', (request, response, next) => {
    const body = request.body;
    const note = new Note({
        content: 'HTML is Easy',
        date: new Date(),
        important: true,
    });
    console.log('note saved!')
    note.save()
        .then(savedNote => savedNote.toJSON())
        .then(savedAndFormattedNote => {
            response.json(savedAndFormattedNote)
        }).catch(error => next(error))
});
/* GET users listing. */
router.get('/', (request, response) => {
    Note.find({}).then(notes => {
        response.json(notes.map(note => note.toJSON()))
    });
});



module.exports = router;
/*Note.find({important: true}).then(result => {
    result.forEach(note => {
        console.log(note)
    })
    mongoose.connection.close()
})*/