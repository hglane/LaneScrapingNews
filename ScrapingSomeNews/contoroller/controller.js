var express = require("express");
var router = express.Router();
var path = require("path");

var request = require("request");
var cheerio = require("cheerio");

var Comment = require("../models/Comment.js");
var Story = require("../models/Story.js");

router.get("/", function (req, res) {
    res.redirect("/stories");
});

router.get("/scrape", function (req, res) {
    request("http://www.mlb.com", function (error, reaponse, html) {
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

router.get("/stories", function (req, res) {
    Story.find().sort({ _id: -1 }).exec(function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            var stry = { story: doc };
            res.render("index", stry);
        }
    });
});

router.get("/stories-json", function (req, res) {
    Story.find({}, function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            res.json(doc);
        }
    });
});

module.exports = router;
