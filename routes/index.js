const authRouter = require("./auth");
const taskRouter = require("./task");
const taskOpRouter = require("./list");

module.exports = (app) =>{
    app.use('/', authRouter);
    app.use('/', taskRouter);
    app.use('/', taskOpRouter);
}