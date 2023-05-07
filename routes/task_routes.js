const tasksRouter = require("express").Router();
const Task = require("../models/task");

// get all tasks of a user
tasksRouter.get('/users/:userid/tasks', async (req, res) => {
    try {
        const {userid} = req.params;
        // TODO: because you need to get the tasks of that user
        // TODO: modify the model
        const tasks = await Task.find();
        if (!tasks) {
            res.status(400).json({
                status: "",
                message: "no tasks were found for this user",
            });
        }
        res.status(200).json({
            status: "success",
            message: "tasks were found for this user",
            tasks: tasks
        });
    } catch (error) {
        res.status(500).json({
            status: "failure",
            message: "failed to signup user due to database errors",
            err: error.message
        });
    }
});

// add task to user
tasksRouter.post('/users/:userid/tasks', async (req, res) => {
    try {
        const {userid} = req.params;
        // TODO: you need to add the task for a specific user
        const task = await Task.create(req.body);
        Task.findOneAndUpdate()
        res.status(201).json({
            status: "success",
            message: "task has been created successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: "failure",
            message: "failed to signup user due to database errors",
            err: error.message
        });
    }
});


// update task of user
tasksRouter.put('/tasks/:taskid', async (req, res) => {
    try {
        const {userid} = req.params
        const {taskid} = req.params
        const task = await Task.findByIdAndUpdate(taskid, req.body);
        if (!task) {
            // return error response
        }
        res.status(201).json({
            status: "success",
            message: "task has been updated successfully",
            task: await Task.findById(taskid)
        });
    } catch (error) {
        res.status(500).json({
            status: "failure",
            message: "failed to signup user due to database errors",
            err: error.message
        });
    }
});

//delete task of a specific user
tasksRouter.delete('/tasks/:taskid', async(req, res) => {
    try {
        const {taskid} = req.params;
        const task = await Task.findByIdAndDelete(taskid)
        if (!task){
            // return failure message
        }
        res.status(201).json({
            status: "success",
            message: "task has been deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            status: "failure",
            message: "failed to signup user due to database errors",
            err: error.message
        });
    }
});


module.exports = tasksRouter;

