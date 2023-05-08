const {Task} = require("../models");

const getTasksOfUser = async (req, res) => {
    try {
        const {userid} = req.params;
        const tasks = await Task.find({userid: userid});
        if (tasks) {
            res.status(200).json({
                status: "success",
                message: "tasks were found for this user",
                tasks: tasks
            });
        } else {
            res.status(400).json({
                status: "pending",
                message: "no tasks were found for this user",
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "failure",
            message: "failed due to errors",
            err: error.message
        });
    }
};

const addTask = async (req, res) => {
    try {
        const task = await Task.create(req.body);
        res.status(201).json({
            status: "success",
            message: "task has been created successfully",
            task: task
        });
    } catch (error) {
        res.status(500).json({
            status: "failure",
            message: "failed to signup user due to database errors",
            err: error.message
        });
    }
}

const updateTask = async (req, res) => {
    try {
        const {id} = req.params
        const task = await Task.findByIdAndUpdate(id, req.body);
        if (!task) {
            res.status(404).json({
                status: "failure",
                message: "no task with this id found",
            })
        }
        res.status(201).json({
            status: "success",
            message: "task has been updated successfully",
            task: await Task.findById(id)
        });
    } catch (error) {
        res.status(500).json({
            status: "failure",
            message: "failed to signup user due to database errors",
            err: error.message
        });
    }
};
const deleteTask = async (req, res) => {
    try {
        const {id} = req.params;
        const task = await Task.findByIdAndDelete(id)
        if (!task) {
            // return failure message
            res.status(404).json({
                status: "failure",
                message: "no task with this id found"
            });
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
};


module.exports = {
    getTasksOfUser,
    addTask,
    updateTask,
    deleteTask
}