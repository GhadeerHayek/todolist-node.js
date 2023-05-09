const Joi = require("@hapi/joi");

const taskMiddleware = (req, res, next) => {

    const schema = Joi.object({
        status: Joi.string().valid('in_progress', 'completed'),
        completion_time: Joi.date().when('status', {is: 'completed', then: Joi.date()}),
        is_subtask: Joi.number().integer().valid(0, 1),
        rank: Joi.number().integer()
    });

    const {error} = schema.validate(req.body);
    if (error) {
        return res.status(400).json({status: "failure", message: error.details[0].message});
    }


    next();

}

module.exports = taskMiddleware;