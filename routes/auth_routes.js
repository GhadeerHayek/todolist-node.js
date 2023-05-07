const authRouter = require("express").Router();
const User = require('../models/user');
authRouter.post('/auth/signup', async (req, res, next) => {
    try {
        //TODO: validate inputs before insertion
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
})

authRouter.post('/auth/login', async (req, res) => {
    try {

        // TODO: validate request before submitting
        // the body shall contain the user email and password, so it
        const user = await User.findOne(req.body);
        // if user found, that means we don't have such user
        if (user) {
            res.status(200).json({
                status: "success",
                message: "user login is successful",
                userid: user._id
                //user_id: user.id,
                //user_name: user.name
            });
        }else{
            res.status(404).json({
                status: "failure",
                message: "user login failed",
            })
        }
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
});


module.exports = authRouter;