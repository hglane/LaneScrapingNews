var express = require("express");
var axios = require("axios");
var path = require("path");
var router = express.Router();

var request = require("request");
var cheerio = require("cheerio");
var app = express();

var Comment = require("../models/Comment.js");
var Story = require("../models/Story.js");

app.get("/", function (req, res) {
    console.log("hit");
    
    res.redirect("/stories");
});

app.get("/scrape", function (req, res) {
    console.log("hit");
    
    axios.get("http://www.mlb.com/").then(function(reaponse, html) {
        var $ = cheerio.load(html);
        var titlesArray = [];

        $("p-featured-content__body").each(function (i, element) {
            var result = {};

            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");

            if (result.title !== "" && result.link !== "") {

                if (titlesArray.indexOf(result.title) == -1) {
                    titlesArray.push(result.title);

                    Story.count({ title: result.title }, function (err, test) {
                        if (test === 0) {
                            var entry = new Story(result);

                            entry.save(function (err, doc) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(doc);
                                }
                            });
                        }
                    });
                } else {
                    console.log("Story already exists.")
                }

            } else {
                console.log("Not saved to DB, missing data");
            }

        });
        res.redirect("/");
    });
});

app.get("/stories", function (req, res) {
    Story.find().sort({ _id: -1 }).exec(function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            var stry = { story: doc };
            res.render("index", stry);
        }
    });
});

app.get("/stories-json", function (req, res) {
    Story.find({}, function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            res.json(doc);
        }
    });
});

app.get("/clearAll", function(req, res) {
    Article.remove({}, function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            console.log("removed all stories");
        }
    });
    res.redirect("/articles-json");
});

app.get("/readStory/:id", function(req, res) {
    var articleId = req.params.id;
    var hbsObj = {
        artile: [],
        body: []
    };

    Story.findOne({ _id: storyId })
        .populate("comment")
        .exec(function(err, doc) {
            if (err) {
                console.log("Error: " + err);
            } else {
                hbsObj.article = doc;
                var link = doc.link;
                request(link, function(error, response, html) {
                    var $ = cheerio.load(html);

                    $(".1col__main").each(function(i, element) {
                        hbsObj.body = $(this)
                        .children("p-featured-content__body")
                        .children("p")
                        .text();

                        res.render("article", hbsObj);
                        return false;
                    });
                });
                
            }
        });
});

app.post("/comment/:id", function(req, res){
    var user = req.body.name;
    var content = req.body.comment;
    var storyId = req.params.id; 

    var commentObj = {
        name: user, 
        body: content
    };

    var newComment = new Comment(commentObj);

    newComment.save(function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            console.log(doc._id);
            console.log(articleId);

            Story.findOneAndUpdate(
                { _id: req.params.id },
                { $push: { comment: doc._id } },
                { new: true }
            ).exec(function(err, doc){
                if (err) {
                    console.log(err);
                } else {
                    res.redirect("/readStory/" + storyId);
                }
            })
            
        }
    });
});



module.exports = app;
