const {Task} = require("../models");

/**
 *
 * @param req request (GET)
 * @param res response
 * @returns {Promise<void>} a list of tasks for a specific user, where the request passes by the auth middleware that checks the token
 */
const getTasksOfUser = async (req, res) => {
    try {
        // the middleware will modify the header and generate a userData which contains the userId
        // get the user tasks using the userid field
        const tasks = await Task.find({userid: req.userData.userId});
        // if user has tasks -> return success and the tasks
        if (tasks) {
            res.status(200).json({
                status: "success",
                message: "tasks were found for this user",
                tasks: tasks
            });
            // if the user has no tasks -> resource (tasks) not found -> return failure with 400 status code
        } else {
            res.status(404).json({
                status: "failure",
                message: "no tasks were found for this user",
            });
        }
    } catch (error) {
        // unexpected error
        res.status(500).json({
            status: "failure",
            message: "failed due to errors",
            err: error.message
        });
    }
};


/**
 *
 * @param req request (POST)
 * @param res response
 * @returns {Promise<void>} takes the task details from request, creates a task in the database and returns its information in the response
 */

const addTask = async (req, res) => {
    try {
        // the userid from the request headers, appended to the request body
        req.body.userid = req.userData.userId;
        // a request to this function also passes by a task middleware that checks and validates all inputs
        const task = await Task.create(req.body);
        if (!task) {
            // error that is handled in the catch clause
            throw new Error("failed to create task");
        } else {
            // task is created -> success
            res.status(201).json({
                status: "success",
                message: "task has been created successfully",
                task: {
                    id: task._id,
                    name: task.name,
                    description: task.description,
                    status: task.status,
                    completion_time: task.completion_time,
                    creation_time: task.createdAt,
                    rank: task.rank,
                    updated_at: task.updatedAt,
                    is_subtask: task.is_subtask,
                    parent_task: task.parent_task
                }
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "failure",
            message: "failed to add task due to errors",
            err: error.message
        });
    }
}
/**
 *
 * @param req request (PUT)
 * @param res response
 * @returns {Promise<void>}takes task information from request, updates the specified fields, returns the updated task information
 */
const updateTask = async (req, res) => {
    try {
        // this request has to pass by the auth middleware even if no userId is used in its logic
        // the task id from the path parameters
        const {id} = req.params
        // let's check if the task id exists and update it
        const task = await Task.findByIdAndUpdate(id, req.body);
        // if the task not found -> resource not found 400 -> halt
        if (!task) {
            res.status(404).json({
                status: "failure",
                message: "no task with this id found",
            })
            // if the task id is found, and is updated -> return 200 success
        } else {
            res.status(201).json({
                status: "success",
                message: "task has been updated successfully",
                task: task._id
            });
        }
    } catch (error) {
        // what errors does this handle exactly?
        res.status(500).json({
            status: "failure",
            message: "failed to update task",
            err: error.message
        });
    }
};

/**
 *
 * @param req request (DELETE)
 * @param res response
 * @returns {Promise<void>} receives task id from request, deletes a task using the task id and returns 200 status code in case of success,
 * 400 in case task was not found, or 500 in case of unexpected errors.
 */
const deleteTask = async (req, res) => {
    // this request has to pass by the auth middleware even if no userId is used in its logic
    try {
        const {id} = req.params;
        const task = await Task.findByIdAndDelete(id)
        // if task is not found -> resource not found 400 -> halt
        if (!task) {
            // return failure message
            res.status(404).json({
                status: "failure",
                message: "no task with this id found"
            });
        } else {

            res.status(201).json({
                status: "success",
                message: "task has been deleted successfully",
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "failure",
            message: "failed to delete task due to errors",
            err: error.message
        });
    }
};


module.exports = {
    getTasksOfUser,
    addTask,
    updateTask,
    deleteTask
}