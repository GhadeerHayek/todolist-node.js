const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');

const app = express();

// middleware to receive requests
app.use(bodyParser.urlencoded({extended: false}));


// routes from other files
const authRouter = require('./routes/auth_routes')
const tasksRouter = require('./routes/auth_routes')
app.use('/', authRouter);
app.use('/', tasksRouter);


// connect to database
const URI = "mongodb+srv://ghadeerhayek2001:ghadeer321@ghadeer-db.op9egxb.mongodb.net/todolist?retryWrites=true&w=majority";
mongoose.connect(URI).then(() => {
    console.log("successfully connected to database");
    app.listen(9000, () => {
        console.log("app is currently running on port 9000");
    })
}).catch((error) => {
    console.log("error connecting to database, app is not starting.");
    console.log(error.message);
})


module.exports = app;