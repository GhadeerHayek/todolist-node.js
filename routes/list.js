const tasksOpRouter = require("express").Router();
const {taskOpController} = require("../controllers")
const authMiddleware = require("../middlewares/authMiddleware");
const {taskMiddleware} = require("../middlewares");

// retrieve all subtasks for a specific task
tasksOpRouter.get('/list/:taskId/subtasks', authMiddleware, taskOpController.getSubtasksOfTask);


// mark task as completed
// tasksOpRouter.put('/tasks/:taskId/status', taskOpController.markAsCompleted);


// get the ratio of completed tasks
tasksOpRouter.get('/list/completed', authMiddleware, taskOpController.completedTasksRatio);


// get the ratio if completion per day
tasksOpRouter.get('/list/completedPerDay', authMiddleware,taskMiddleware, taskOpController.completionMeanByDay);


// mark a task as completed

tasksOpRouter.put('/list/:taskId/markAsCompleted', authMiddleware, taskOpController.markAsCompleted);

module.exports = tasksOpRouter;