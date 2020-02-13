var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var logger = require("morgan");

var express = require("express");
var app = express();

var routes = require("./contorollers/controller");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://user:password1@ds049347.mlab.com:49347/heroku_zfk75m1h";

mongoose.connect(MONGODB_URI);


app.use(logger("dev"));
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);

app.use(express.static(process.cwd() + "/public"));

var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({defaultLayout: "main"})
);
app.set("view engine", "handlebars");

app.use(routes);

//const MONGODB_URI = "mongodb://localhost:27017/mlbArticles" 
    //  || process.env.MONGODB_URI
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

var db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    console.log("Goose got me loose!");
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("Rockin' and Rollin' on PORT " + port);
});