const logger = require('./logger');
const jwt = require("jsonwebtoken");
const User = require('../models/user');
const assert = require("assert");

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method);
    console.log('Path:  ', request.path);
    console.log('Body:  ', request.body);
    console.log('---');
    next()
}
//+++++++++++++A DEFINIR ! ++++++++++++++++++++++++++++++++
const unknownEndpoint = (request, response) => {
    response.status(404).send({error: '(middleware.js)unknown endpoint'})
}
//+++++++++++++A DEFINIR ! ++++++++++++++++++++++++++++++++
const errorHandler = (error, request, response, next) => {
    console.error('(middleware.js)' + error.message);
    logger.error('(middleware.js)' + error.message);
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return response.status(400).send({error: '(middleware.js)malformatted id'})
    } else if (error.name === '(middleware.js)ValidationError') {
        return response.status(400).json({error: '(middleware.js)' + error.message})
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(401).json({
            error: 'invalid token'
        });
    }
    next(error)
};


//_____CONTROLE SIL Y A UN TOKEN VALIDE_QUI PERMETTRAIT DE CREER DE NOUVELLES NOTES _______________________________
function getTokenFrom(request) {
    const authorization = request.get('authorization');
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
    return null
};

async function decodeUser(request, response, next) {
    const token = getTokenFrom(request);
    if (!token) {
        next();
        return;
    }

    const decodedToken = jwt.verify(token, process.env.SECRET);
    if (!token || !decodedToken.id || token.expiry < Date.now()) {
        next();
        return;
    }

    request.user = await User.findById(decodedToken.id);
    next();
}

async function ensureLoggedIn(request, response, next) {
    assert(!!request.user, "Vous devez être connecté");
    next();
}

module.exports = {
    decodeUser,
    ensureLoggedIn,
    requestLogger,
    unknownEndpoint,
    errorHandler
};
