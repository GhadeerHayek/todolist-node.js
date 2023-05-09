const {Task} = require("../models");

const getTasksOfUser = async (req, res) => {
    try {
        // assuming that this request has passed by the auth middleware
        // the middleware will modify the header and generate a userData which contains the userid
        const tasks = await Task.find({userid:req.userData.userId});
        if (tasks) {
            res.status(200).json({
                status: "success",
                message: "tasks were found for this user",
                tasks: tasks
            });
        } else {
            res.status(404).json({
                status: "failure",
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
        // the userid from the request headers, appended to the request body
        req.body.userid = req.userData.userId;
        const task = await Task.create(req.body);
        console.log(task);
        console.log(req.body);
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
    } catch (error) {
        res.status(500).json({
            status: "failure",
            message: "failed to add task due to errors",
            err: error.message
        });
    }
}

const updateTask = async (req, res) => {
    try {
        // this request has to pass by the auth middleware even if no userId is used in its logic
        const {id} = req.params
        const task = await Task.findByIdAndUpdate(id, req.body);
        // if the task not found, this handles this error
        if (!task) {
            res.status(404).json({
                status: "failure",
                message: "no task with this id found",
            })
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
const deleteTask = async (req, res) => {
    // this request has to pass by the auth middleware even if no userId is used in its logic
    try {
        const {id} = req.params;
        const task = await Task.findByIdAndDelete(id)
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