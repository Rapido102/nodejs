const notesRouter = require('express').Router();
const Note = require('../models/note');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

//_____CONTROLE SIL Y A UN TOKEN VALIDE_QUI PERMETTRAIT DE CREER DE NOUVELLES NOTES _______________________________
const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
    return null
};
//_____AFFICHER TOUTES LES NOTES__________________________________________________________________________________
notesRouter.get('/', async (request, response) => {
    const notes = await Note
        .find({}).populate('user', { username: 1, name: 1 });
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
    const token = getTokenFrom(request);
    /*TRY CONTROLE SIL Y A UN TOKEN VALIDE AVANT DE POSTER QUELQUE CHOSE DINTERDIT
    * Helper function getTokenFrom isolates the token from the authorization header.
    * The validity of the token is checked with jwt.verify.
    * The method also decodes the token, or returns the Object which the token was based on*/
    try {
        const decodedToken = jwt.verify(token, process.env.SECRET);
        if (!token || !decodedToken.id) {
            return response.status(401).json({ error: '(Controllers/login/post)token missing or invalid' })
        }

        const user = await User.findById(decodedToken.id);

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
    } catch (exception) {
        next(exception)
    }
}
);

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
