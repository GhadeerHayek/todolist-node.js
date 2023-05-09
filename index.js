require("dotenv/config")
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const routes = require("./routes")
const app = express();

// middleware to receive requests
// i had to use this so i can send url encoded from postman
app.use(bodyParser.urlencoded({extended: false}));


// routes from other files
routes(app);


// connect to database
mongoose.connect(process.env.URI).then(() => {
    console.log("successfully connected to database");
    app.listen(process.env.PORT, () => {
        console.log(`app is currently running on port ${process.env.PORT}`);
    })
}).catch((error) => {
    console.log("error connecting to database, app is not starting.");
    console.log(error.message);
})