const express = require("express");
const mongoose = require("mongoose");

const app = express();


// connect to database
const URI = "mongodb+srv://ghadeerhayek2001:ghadeer321@ghadeer-db.op9egxb.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(URI).then(() => {
    console.log("successfully connected to database");
    app.listen(9000, () => {
        console.log("app is currently running on port 9000");
    })
}).catch((error) => {
    console.log("error connecting to database, app is not starting.");
})
