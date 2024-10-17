const express = require("express");
const http = require("http");
const app = express();
const path = require("path");
const ejs = require("ejs");
const mongoose = require("mongoose");
const Scores = require("./models/Scores");
const math = require("./public/js/math");

mongoose.connect("mongodb://localhost:27017/dbscores", {
	useNewUrlParser: true,
});

app.set("view engine", "ejs");

app.use(express.static("public"));

app.listen(3000, () => {
	console.log("App listening on port 3000");
});

app.get("/", (req, res) => {
	//res.sendFile(path.resolve(__dirname,'index.html'))
	res.render("index");
});

app.get("/scores", async (req, res) => {
	const scores = await Scores.find({});
	res.render("scores", {
		scores: scores,
	});
});

app.get("/dashboard", async (req, res) => {
	const scores = await await Scores.find({});
	const sort_by = (field, reverse, primer) => {
		const key = primer
			? function (x) {
					return primer(x[field]);
			  }
			: function (x) {
					return x[field];
			  };

		reverse = !reverse ? 1 : -1;

		return function (a, b) {
			return (a = key(a)), (b = key(b)), reverse * ((a > b) - (b > a));
		};
	};
	scores.sort(sort_by("pretest", true, parseInt));
	res.render("dashboard", {
		scores,
	});
});

app.get("/about", (req, res) => {
	//res.sendFile(path.resolve(__dirname,'pages/about.html'))
	res.render("about");
});

app.get("/contact", (req, res) => {
	//res.sendFile(path.resolve(__dirname,'pages/contact.html'))
	res.render("contact");
});

app.get("/post", (req, res) => {
	//res.sendFile(path.resolve(__dirname,'pages/post.html'))
	res.render("post");
});
