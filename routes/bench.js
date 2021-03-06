const benchRouter = require('express').Router();
const Bench = require('../models/bench');
const { ensureLoggedIn } = require("../utils/middleware");
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
    return null
};

benchRouter.use(ensureLoggedIn);

benchRouter.get('/', async (request, response) => {
    const benchs = await Bench
        .find({}).populate('user', { username: 1, name: 1 });
    response.json(benchs.map(bench => bench.toJSON()))
});

benchRouter.post('/', async (request, response, next) => {
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
        console.log('USER==' + user)
        const bench = new Bench({
            titre: body.titre,
            resultat: body.resultat,
            cat: body.cat,
            date: body.date,
            user: user._id
        });
        console.log('(Routes/bench______' + bench);

        const savedBench = await bench.save();
        user.benchs = user.benchs.concat(savedBench._id);
        await user.save();
        response.json(savedBench.toJSON());
        console.log('(Controllers/notes)benchmark saved!')
    } catch (exception) {
        next(exception)
    }
}
);
benchRouter.put('/:id', (request, response, next) => {
    const body = request.body
    console.log(request.params.id);
    const bench = {
        titre: body.titre,
        resultat: body.resultat,
        // important: body.important,
        // inside: body.inside,
        // date: body.date,
        update: body.update
    };
    Bench.findByIdAndUpdate(request.params.id, bench, { new: true })
        .then(updateBench => {
            response.json(updateBench.toJSON())
        })
        .catch(error => next(error))
});

benchRouter.delete('/:id', (request, response, next) => {
    Bench.findByIdAndRemove(request.params.id)
        .then(() => {
            response.status(204).end()
        })
        .catch(error => next(error))
});


module.exports = benchRouter;
