const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const secertkey = "somesecretkey";
// TODO: create environment variables to contain the .env variables such as the secret key


const generateToken = async (userId) => {
    try {
        const token = await jwt.sign({userId}, secertkey, {expiresIn: '30m'});
        return token;
    } catch (error) {
        return null;
    }
}


module.exports = generateToken;