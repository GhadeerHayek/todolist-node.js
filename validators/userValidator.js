const Joi = require("@hapi/joi");

const loginValidator = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required(),
});


module.exports = loginValidator;