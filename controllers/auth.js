const {User} = require("../models");
const bcrypt = require("bcrypt");
const generateToken = require("../helpers/token")
const {loginValidator} = require("../validators");

/**
 *
 * @param req: request (POST)
 * @param res  response
 * @returns {Promise<void>}returns 201 status code in case of successful insertion, 404 in case of email duplication, or 500 in case of invalid inputs and unexpected errors.
 */
const signup = async (req, res) => {
    try {
        // all the inputs are validated because of mongoose schema and validation messages
        // if anything goes wrong, the process terminates and an appropriate error message is printed
        // check the uniqueness of an email
        const emailCheck = await User.findOne({email: req.body.email});
        if (emailCheck) {
            // halt
            res.status(404).json({
                status: "failure",
                message: "This email has already been registered, try different one",
            });
        } else {
            // get a hashed password and store it in the database
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            req.body.password = hashedPassword;
            // store the user
            const user = await User.create(req.body);
            // return success
            res.status(201).json({
                status: "success",
                message: "the user is created, signup with the email and password",
                user_email: user.email,
            });
        }
    } catch (error) {
        // validation erros, unexpected errors are handled here
        res.status(500).json({
            status: "failure",
            message: "error while trying to signup user.",
            err: error.message
        });
    }
}

/**
 *
 * @param req request (POST)
 * @param res response
 * @returns {Promise<void>} returns 200 status code along with authentication token in case of success, 404 in case email or password not found/matched
 * or 500 in case of unexpected errors
 */

const login = async (req, res) => {
    try {
        // a specific login validator to check the email and password
        const {error, value} = loginValidator.validate(req.body);
        if (error) {
            // halt
            res.status(500).json({
                status: "failure",
                message: "Authentication failed: invalid input",
                error: error.message
            });
        }
        // check if the user is in the database using the email
        const user = await User.findOne({email: value.email});
        // if email not found, that means we don't have such user
        if (!user) {
            // halt
            res.status(404).json({
                status: "failure",
                message: "Authentication failed: email doesn't exist.",
            });
        } else {
            // get the password from request, hash it
            // compare the stored hash and the calculated hash
            const isMatch = await bcrypt.compare(value.password.trim(), user.password.trim());
            // if the hash is not matched -> halt
            if (!isMatch) {
                res.status(401).json({status: "failure", message: 'Authentication failed: password is wrong.'});
            } else {
                // if the password is matched, then the user is authorized
                // generate token
                const token = await generateToken(user._id);
                // send the token in the response body
                res.status(200).json({
                    status: "success",
                    message: "user login is successful",
                    token: token
                });
            }
        }
    } catch (error) {
        // catch any error that has occurred during the operation
        // i think all the cases have been handled
        // but this one is in case of unexpected errors
        res.status(500).json({
            status: "failure",
            message: "failed to login due to errors",
            err: error.message
        });
    }
}

//TODO future work: logout for more security and control

module.exports = {
    login,
    signup
}