//npm uninstall bcrypt --save _________________________________________________________________________
const bcrypt = require('bcrypt');
//_____________________________________________________________________________________________________
const usersRouter = require('express').Router();
const User = require('../models/user');
//____AJOUTER DUN NOUVEL UTILISATEUR_________________________________________________________________________
/**
 * @swagger
 * /api/users:
 *   post:
 *     tags:
 *       - Users
 *     name: Login
 *     summary: Logs in a user
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           $ref: '#/definitions/User'
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *             password:
 *               type: string
 *               format: password
 *         required:
 *           - username
 *           - password
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 *       401:
 *         description: Bad username, not found in db
 *       403:
 *         description: Username and password don't match
 */
usersRouter.post('/', async (request, response, next) => {
    try {
        const body = request.body;
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(body.password, saltRounds);

        const user = new User({
            username: body.username,
            name: body.name,
            email: body.userMail,
            passwordHash,
        });

        // user.notes = user.notes.concat(savedNote._id);
        const savedUser = await user.save();
        console.log(savedUser)
        response.json(savedUser)
    } catch (exception) {
        next(exception)
    }
});
//________AFFICHAGE ALL USERS_______________________________________________________________________________________
//METHODE POPULATE A EXPLIQUER______________________________________________________________________________________
/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     name: Login
 *     summary: Logs in a user
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           $ref: '#/definitions/User'
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *             password:
 *               type: string
 *               format: password
 *         required:
 *           - username
 *           - password
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 *       401:
 *         description: Bad username, not found in db
 *       403:
 *         description: Username and password don't match
 */
usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('notes', {content: 1, date: 1});
    response.json(users.map(u => u.toJSON()))
});

usersRouter.post('/forgot', async(req,res) => {
    
})


module.exports = usersRouter;


