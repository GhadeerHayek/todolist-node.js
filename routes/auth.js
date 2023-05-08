const authRouter = require("express").Router();
const {authController} = require("../controllers")

authRouter.post('/auth/signup', authController.signup);

authRouter.post('/auth/login', authController.login);


module.exports = authRouter;