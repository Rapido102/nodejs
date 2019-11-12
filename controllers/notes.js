const {ensureLoggedIn} = require( "../utils/middleware");
const Router = require("express-promise-router");
const notesRouter = Router();
const Note = require('../models/note');

notesRouter.use(ensureLoggedIn);

//_____AFFICHER TOUTES LES NOTES__________________________________________________________________________________
notesRouter.get('/', async (request, response) => {
    const notes = await Note
        .find({user: request.user._id}).populate('user', { username: 1, name: 1 });
    response.json(notes.map(note => note.toJSON()))
});

notesRouter.get('/:id', (request, response, next) => {
    Note.findById(request.params.id)
        .then(note => {
            if (note) {
                response.json(note.toJSON())
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
});

notesRouter.post('/', async (request, response, next) => {
    const body = request.body;

    const note = new Note({
        content: body.content,
        important: body.important || false,
        date: new Date(),
        user: user._id
    });
    console.log('(Controllers/notes______' + note);

    const savedNote = await note.save();
    user.notes = user.notes.concat(savedNote._id);
    await user.save();
    response.json(savedNote.toJSON());
    console.log('(Controllers/notes)_____note saved!')
});

notesRouter.delete('/:id', (request, response, next) => {
    Note.findByIdAndRemove(request.params.id)
        .then(() => {
            response.status(204).end()
        })
        .catch(error => next(error))
});

notesRouter.put('/:id', (request, response, next) => {
    const body = request.body

    const note = {
        content: body.content,
        important: body.important,
        date: body.date
    };

    Note.findByIdAndUpdate(request.params.id, note, { new: true })
        .then(updatedNote => {
            response.json(updatedNote.toJSON())
        })
        .catch(error => next(error))
});

module.exports = notesRouter
