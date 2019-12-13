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
        const savedUser = await user.save();
        // console.log(savedUser);
        response.json(savedUser)
    } catch (e) {
        next(e)
    }
});
//________AFFICHAGE ALL USERS_______________________________________________________________________________________
usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('notes', { content: 1, date: 1 });
    response.json(users.map(u => u.toJSON()))
});

usersRouter.put('/:id', async (request, response, next) => {
    const body = request.body

    const updateUser = {
        username: body.username,
        name: body.name,
        email: body.email,
        update: new Date().toISOString().slice(0, 10),
    };

    User.findByIdAndUpdate(request.params.id, updateUser, { new: true })
        .then(data => {
            response.json(data.toJSON());
        })
        .catch(error => next(error))

    // const user = await User.findOne({ id: request.params.id });
    // const userForToken = {
    //     username: user.username,
    //     id: user._id,
    //     expiry: Date.now() + 3600 * 1000
    // };
    // const token = jwt.sign(userForToken, process.env.SECRET);
    // response
    //     .status(200)
    //     .send({ token, username: user.username, name: user.name, id: user.id, role: user.role, email: user.email })
});

module.exports = usersRouter;


