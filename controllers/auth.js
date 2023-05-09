const {User} = require("../models");
const bcrypt = require("bcrypt");
const generateToken = require("../helpers/token")
const {loginValidator} = require("../validators");

const signup = async (req, res) => {
    try {
        const emailCheck = await User.findOne({email: req.body.email});
        if (emailCheck) {
            res.status(404).json({
                status: "failure",
                message: "This email has already been registered, try different one",
            });
        } else {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            req.body.password = hashedPassword;
            const user = await User.create(req.body);
            res.status(201).json({
                status: "success",
                message: "the user is created, signup with the email and password",
                user_email: user.email,
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "failure",
            message: "error while trying to signup user.",
            err: error.message
        });
    }
}


const login = async (req, res) => {
    try {
        const {error, value} = loginValidator.validate(req.body);
        if (error) {
            res.status(500).json({
                status: "failure",
                message: "Authentication failed: invalid input",
                error: error.message
            });
        }
        // the body shall contain the user email and password, so it
        const user = await User.findOne({email: value.email});
        // if user found, that means we don't have such user
        if (!user) {
            res.status(404).json({
                status: "failure",
                message: "Authentication failed: email doesn't exist.",
            });
        } else {
            const isMatch = await bcrypt.compare(value.password.trim(), user.password.trim());
            if (!isMatch) {
                res.status(401).json({status: "failure", message: 'Authentication failed: password is wrong.'});
            } else {
                // generate token
                const token = await generateToken(user._id);
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

//TODO: logout

module.exports = {
    login,
    signup
}