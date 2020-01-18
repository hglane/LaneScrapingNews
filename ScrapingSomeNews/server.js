var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var logger = require("morgan");

var express = require("express");
var app = express();

app.use(logger("dev"));
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);

app.use(express.static(process.cwd() + "/public"));

var exphbs = require("express-handlebars");
app.engine("handlebars",exphbs({defaultLayout: "main"})
);
app.set("view engine", "handlebars");

mongoose.connect("mongodb://localhost/ScrapingSomeNews");
var db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    console.log("Goose got me loose!");
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
    console.log("Rockin' and Rollin' on PORT " + port);
});