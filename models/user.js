const mongoose = require('mongoose');
//____npm install --save mongoose-unique-validator____________________________________________________________________
const uniqueValidator = require('mongoose-unique-validator');
//____________________________________________________________________________________________________________________

const userSchema = mongoose.Schema({
    username: {
        type: String,
        unique: true
    },
    name: String,
    email: String,
    role: String,
    passwordHash: String,
    notes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Note'
        }
    ],
    benchs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Note'
        }
    ],
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

userSchema.plugin(uniqueValidator);

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
        // the passwordHash should not be revealed
        delete returnedObject.passwordHash
    }
});
//__________________________________________________________________________________________________________________
const User = mongoose.model('User', userSchema);

module.exports = User;
