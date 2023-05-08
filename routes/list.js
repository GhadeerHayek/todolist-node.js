const tasksOpRouter = require("express").Router();
const {taskOpController} = require("../controllers")

// retrieve all subtasks for a specific task
tasksOpRouter.get('/list/:taskId/subtasks', taskOpController.getSubtasksOfTask);


// mark task as completed
// tasksOpRouter.put('/tasks/:taskId/status', taskOpController.markAsCompleted);


// get the ratio of completed tasks
tasksOpRouter.get('/list/completed', taskOpController.completedTasksRatio);



// get the ratio if completion per day
tasksOpRouter.get('/list/completedPerDay', taskOpController.completionMeanByDay);


module.exports = tasksOpRouter;