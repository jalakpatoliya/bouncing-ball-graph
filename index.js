const express = require("express");

const PORT = process.env.PORT || 3000;
const app = express();
const bodyParser = require("body-parser");
const bouncingBallRoute = require('./routes/bouncingBallRoutes');

app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Importing routes
 */
app.use(bouncingBallRoute);

/**
 * listening to port
 */
app.listen(PORT, function () {
    console.log(`server connected at port:${PORT}`);
})