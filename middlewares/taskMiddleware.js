const Joi = require("@hapi/joi");
/**
 *
 * @param req request object
 * @param res response object
 * @param next next middleware in the stack
 * @returns {*} validates request regarding the task resources against the defined set of rules.
 */
const taskMiddleware = (req, res, next) => {

    const schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string(),
        status: Joi.string().valid('in_progress', 'completed'),
        completion_time: Joi.date().when('status', {is: 'completed', then: Joi.date()}),
        is_subtask: Joi.number().integer().valid(0, 1),
        rank: Joi.number().integer(),
        parent_task: Joi.string().pattern(/^[0-9a-fA-F]{24}$/)
    });

    const {error} = schema.validate(req.body);
    if (error) {
        return res.status(400).json({status: "failure", message: error.details[0].message});
    }


    next();

}

module.exports = taskMiddleware;