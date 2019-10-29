const logger = require('./logger')
const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}
//+++++++++++++A DEFINIR ! ++++++++++++++++++++++++++++++++
const unknownEndpoint = (request, response) => {
    response.status(404).send({error: '(middleware.js)unknown endpoint'})
}
//+++++++++++++A DEFINIR ! ++++++++++++++++++++++++++++++++
const errorHandler = (error, request, response, next) => {
    console.error('(middleware.js)' + error.message)
    logger.error('(middleware.js)' + error.message)
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

    module.exports = {
        requestLogger,
        unknownEndpoint,
        errorHandler
    };