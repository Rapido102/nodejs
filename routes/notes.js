const { ensureLoggedIn } = require("../utils/middleware");
const Router = require("express-promise-router");
const notesRouter = Router();
const Note = require('../models/note');

notesRouter.use(ensureLoggedIn);

//_____AFFICHER TOUTES LES NOTES__________________________________________________________________________________
notesRouter.get('/', async (request, response) => {
    const notes = await Note
        .find({ user: request.user._id }).populate('user', { username: 1, name: 1 });
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
//Route de la recherche de notes========================
notesRouter.get('/search/:search', async (request, response, next) => {
    console.log("-----------", request.params.search);
    let query = request.params.search

    const note = await Note.find({ "content": { "$regex": query, "$options": "i" } }).populate('user', { username: 1, name: 1 });

    console.log(note, "---------------note retourned by searching");
    response.json(note.map(note => note.toJSON()));
});

notesRouter.post('/', async (request, response, next) => {
    const body = request.body;

    const note = new Note({
        content: body.content,
        important: body.important || false,
        date: body.date,
        inside: body.inside,
        update: new Date().toISOString().slice(0, 10),
        user: request.user._id
    });
    console.log('(Routes/notes______' + note);
    const savedNote = await note.save();
    request.user.notes = request.user.notes.concat(savedNote._id);
    await request.user.save();
    response.json(savedNote.toJSON());
    console.log('(Routes/notes)_____note saved!')
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
        inside: body.inside,
        date: body.date,
        update: new Date().toISOString().slice(0, 10),
    };

    Note.findByIdAndUpdate(request.params.id, note, { new: true })
        .then(updatedNote => {
            response.json(updatedNote.toJSON())
        })
        .catch(error => next(error))
});

module.exports = notesRouter
