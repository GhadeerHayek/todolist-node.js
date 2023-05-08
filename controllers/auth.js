const {User} = require("../models");
const bcrypt = require("bcrypt");
const generateToken = require("../helpers/token")


const signup = async (req, res, next) => {
    try {
        // TODO: validate inputs before insertion
        // TODO: check whether email is unique
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        req.body.password = hashedPassword;
        const user = await User.create(req.body);
        res.status(201).json({
            status: "success",
            message: "the user is created, signup with the email and password",
            user_email: user.email,
        });
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
        // TODO: validate request before submitting
        // the body shall contain the user email and password, so it
        const user = await User.findOne({email: req.body.email});
        // if user found, that means we don't have such user
        if (!user) {
            res.status(404).json({
                status: "failure",
                message: "Authentication failed: invalid credentials 1.",
            });
        }
        const isMatch = await bcrypt.compare(req.body.password.trim(), user.password.trim());
        if (!isMatch) {
            res.status(401).json({status: "failure", message: 'Authentication failed: invalid credentials 2.'});
        }
        // generate token
        const token = await generateToken(user._id);
        res.status(200).json({
            status: "success",
            message: "user login is successful",
            token: token
        });

    } catch (error) {
        // catch any error that has occurred during the operation
        const errorResponse = {
            status: "failure",
            message: "failed to login user due to errors",
            err: error
        };
        console.log(errorResponse);
        res.status(500).json(errorResponse);
    }
}

//TODO: logout

module.exports = {
    login,
    signup
}