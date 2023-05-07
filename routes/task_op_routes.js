const tasksOpRouter = require("express").Router();
const Task = require("../models/task");


// retrieve all subtasks for a specific task
tasksOpRouter.get('/tasks/:taskId/subtasks', async (req, res) => {
    const {taskId} = req.params;
    try {
        const subtasks = await Task.find({parent_task: taskId});
        if (!subtasks) {
            res.status(404).json({
                status: "failure",
                message: "no sub tasks for this task"
            });
        }
        res.status(200).json({
            status: "success",
            message: `the following subtasks belong to the task ${taskId}`,
            subtasks: subtasks
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 'failure',
            message: 'failed to get results'
        });
    }
});

// mark task as completed
tasksOpRouter.put('/tasks/:taskId/status', async (req, res) => {
    const {taskId} = req.params;
    try {
        const task = await Task.findOneAndUpdate(taskId, req.body);
        if (!task) {
            res.status(404).json({
                status: "failure",
                message: "no task found"
            });
        }
        res.status(200).json({
            status: "success",
            message: `the following task ${taskId} status has been updated`,
            task: await Task.findById(taskId)
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 'failure',
            message: 'failed to update status'
        });
    }
});

module.exports = tasksOpRouter;