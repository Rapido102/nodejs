require('dotenv').config()

let PORT = process.env.PORT
let MONGODB_URI = process.env.MONGODB_URI
//__________________________________________________________________________________
if (process.env.NODE_ENV === 'test') {
    MONGODB_URI = process.env.TEST_MONGODB_URI
}
//__________________________________________________________________________________

module.exports = {
    MONGODB_URI,
    PORT
}