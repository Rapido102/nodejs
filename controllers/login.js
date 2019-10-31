//________npm install jsonwebtoken --save___________________________________________________________________________
const jwt = require('jsonwebtoken');
//__________________________________________________________________________________________________________________
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();
const User = require('../models/user');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const passwordResetToken = require('../models/resetPassword')

//__________________________________________________________________________________________________________________
/* The code starts by searching for the user from the database by the username attached to the request. Next,
 it checks the password, also attached to the request. Because the passwords themselves are not saved to the database,
  but hashes calculated from the passwords, bcrypt.compare method is used to check if the password is correct: */
/**
 * @swagger
 * /api/login:
 *   post:
 *     tags:
 *       - Login
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
loginRouter.post('/', async (request, response) => {
    const body = request.body;

    const user = await User.findOne({username: body.username});
    const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(body.password, user.passwordHash);

    if (!(user && passwordCorrect)) {
        return response.status(401).json({
            error: '(Controllers/login)____ invalid username or password'
        })
    }
    //________________________________________________________________________________________________________________
    // If the password is correct, a token is created with method jwt.sign.
    // The token contains the username and user_id in a digitally signed form
    const userForToken = {
        username: user.username,
        id: user._id,
    };

    const token = jwt.sign(userForToken, process.env.SECRET);
    response
        .status(200)
        .send({token, username: user.username, name: user.name, id: user.id})
});
//_________________________________________________________________________________________________________________
loginRouter.post('/forgot', async (req, res, next) => {
    //check si un email est envoyé dans la requête
    if (!req.body.userMail) {
        return res
            .status(500)
            .json({message: 'Email is required'});
    }
    console.log('check reception de l-adresse mail ====> OK')
    //check si l'email correspond a un utilisteur de la BDD

    const user = await User.findOne({email: req.body.userMail});
    //console.log(user);
    if (!user) {
        return res
            .status(409)
            .json({message: 'Email does not exist'});

    }
    console.log('check user et mail correspondant ====> OK')
    const resettoken = new passwordResetToken({
        _userId: user.id,
        resettoken: crypto.randomBytes(16).toString('hex')
    });
    user.resetPasswordToken = resettoken;
    user.resetPasswordExpires = Date.now() + 3600000;
    console.log('edition du nouveau token ====> OK');

    user.save((resettoken, user));

    console.log('sauvegarde du nouveau token avec l-user ====> OK');

    /*passwordResetToken.find({_userId: user._id, resettoken: {$ne: resettoken.resettoken}}).remove().exec();
    res.status(200).json({message: 'Reset Password successfully.'});*/

//configuration de nodemailer pour lenvoye du mail
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'dylanzabaleta@gmail.com',
            pass: '01347965'
        }
    });
    console.log('creation transport pour envoie mail ====> OK')

//contenu du mail envoyé par nodemailer
    const mailOptions = {
        to: user.email,
        from: "dylanzabaleta@gmail.com",
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://localhost:3000/valid-password-token/' + resettoken.resettoken + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
    };
//check if erreur lors de l'envoie du mail
    const sendEmail = () => {
        transporter.sendMail(mailOptions, (err, info) => {
            //mettre ici un gestion d'erreur
            console.log(`** Email sent **`)
        })
    };
    sendEmail()
})

;

loginRouter.get('/valid-password-token/:token', async (req, res) => {
    console.log('PARAM RESETTOKEN lors du clic mail ==== ' + req.params.token);
    const user = await User.findOne({
        resetPasswordToken: {$regex: "" + req.params.token + ""}, resetPasswordExpires: {$gt: Date.now()}
    });
    if (!user) {
        return res.redirect('/forgot');
    }
    console.log('CHECK SI USER TROUVER ====OK');
    console.log('RESET MDP DE L-USER AUTORISE ====OK');
    console.log('REDIRECTION VERS FORMULAIRE RESET ====OK')
});

loginRouter.post('/new-password', async (req, res, next) => {
    console.log('CHECK PARAMS FINAL ==== ' + req.body.token)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(req.body.password, saltRounds);
    console.log('GENERATION DU MDP HASH ====OK');
    const filter = {resetPasswordToken: {$regex: "" + req.body.token + ""}, resetPasswordExpires: {$gt: Date.now()}};
    const update = {passwordHash: passwordHash, resetPasswordToken: undefined, resetPasswordExpires: undefined};
    await User.findOneAndUpdate(filter, update, (error, doc) => {

    });
    console.log('PASSWORD RESET ====OK!!!!')
});
//_________________________________________________________________________________________________________________
module.exports = loginRouter
