const tasksOpRouter = require("express").Router();
const {taskOpController} = require("../controllers")
const authMiddleware = require("../middlewares/authMiddleware");
const {taskMiddleware} = require("../middlewares");

// retrieve all subtasks for a specific task
tasksOpRouter.get('/list/:taskId/subtasks', authMiddleware, taskOpController.getSubtasksOfTask);


// get the system statistics ( completion rate, daily completion rate)
tasksOpRouter.get('/list/statistics', authMiddleware, taskOpController.getSystemStatistics);


// mark a task as completed
tasksOpRouter.put('/list/:taskId/markAsCompleted', authMiddleware, taskOpController.markAsCompleted);


module.exports = tasksOpRouter;