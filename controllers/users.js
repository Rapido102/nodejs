//npm uninstall bcrypt --save _________________________________________________________________________
const bcrypt = require('bcrypt');
//_____________________________________________________________________________________________________
const usersRouter = require('express').Router();
const User = require('../models/user');
//____AJOUTER DUN NOUVEL UTILISATEUR_________________________________________________________________________
usersRouter.post('/', async (request, response, next) => {
    try {
        const body = request.body;
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(body.password, saltRounds);

        const user = new User({
            username: body.username,
            name: body.name,
            email: body.userMail,
            role: 'user',
            passwordHash,
        });

        // user.notes = user.notes.concat(savedNote._id);
        const savedUser = await user.save();
        console.log(savedUser);
        response.json(savedUser)
    } catch (exception) {
        next(exception)
    }
});
//________AFFICHAGE ALL USERS_______________________________________________________________________________________
usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('notes', {content: 1, date: 1});
    response.json(users.map(u => u.toJSON()))
});

module.exports = usersRouter;


