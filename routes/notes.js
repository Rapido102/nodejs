const express = require('express');
const router = express.Router();
const mysql = require('mysql');


/* GET users listing. */
router.get('/', function (req, res, next) {
    db.query('SELECT `id`, `titre` FROM mes_biens', function (error, results, fields) {
        if (error) throw error;
        //console.log(results)
        return res.send({data: results});
    });
});

// appeler cette fonction en utilisant http://127.0.0.1:3000/add
router.post('/add', function (request, response) {
    const body = request.body;
    if (body.content === undefined) {
        return response.status(400).json({error: 'content missing'})
    }
    const note = new Note({
        content: body.content,
        important: body.important || false,
        date: new Date(),
    });

    note.save()
        .then(savedNote => {
            response.json(savedNote.toJSON())
        })
        .catch(error => next(error))
});

router.get('/:id', (request, response) => {
    const id = Number(request.params.id)
    const note = notes.find(note => note.id === id)
    if (note) {
        response.json(note)
    } else {
        response.status(404).end()
    }
});
router.delete('/:id', (request, response) => {
    const id = Number(request.params.id)
    notes = notes.filter(note => note.id !== id)

    response.status(204).end()
})
//========================================================
const generateId = () => {
    const maxId = notes.length > 0
        ? Math.max(...notes.map(n => n.id))
        : 0
    return maxId + 1
}
router.post('/notes', (request, response) => {
    const body = request.body

    if (!body.content) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const note = {
        content: body.content,
        important: body.important || false,
        date: new Date(),
        id: generateId(),
    }

    notes = notes.concat(note)

    response.json(note)
})
module.exports = router;
