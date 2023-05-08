const tasksRouter = require("express").Router();
const {taskController} = require("../controllers")


// get all tasks of a user
tasksRouter.get('/users/:userid/tasks', taskController.getTasksOfUser);


// add task to user
tasksRouter.post('/tasks', taskController.addTask);


// update task of user
tasksRouter.put('/tasks/:id', taskController.updateTask);


//delete task of a specific user
tasksRouter.delete('/tasks/:id', taskController.deleteTask);


module.exports = tasksRouter;

