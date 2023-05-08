const tasksRouter = require("express").Router();
const {taskController} = require("../controllers")
const authMiddleware = require("../middlewares/token");


// get all tasks of a user
tasksRouter.get('/tasks',authMiddleware, taskController.getTasksOfUser);


// add task to user
tasksRouter.post('/tasks',authMiddleware, taskController.addTask);


// update task of user
tasksRouter.put('/tasks/:id',authMiddleware, taskController.updateTask);


//delete task of a specific user
tasksRouter.delete('/tasks/:id',authMiddleware, taskController.deleteTask);


module.exports = tasksRouter;

