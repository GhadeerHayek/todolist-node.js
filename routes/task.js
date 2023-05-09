const tasksRouter = require("express").Router();
const {taskController} = require("../controllers")
const {authMiddleware, taskMiddleware} = require("../middlewares");


// get all tasks of a user
tasksRouter.get('/tasks', authMiddleware, taskController.getTasksOfUser);


// add task to user
tasksRouter.post('/tasks', authMiddleware, taskMiddleware, taskController.addTask);


// update task of user
tasksRouter.put('/tasks/:id', authMiddleware, taskMiddleware, taskController.updateTask);


//delete task of a specific user
tasksRouter.delete('/tasks/:id', authMiddleware, taskMiddleware, taskController.deleteTask);


module.exports = tasksRouter;

