const express = require("express");
const http = require("http");
const app = express();
const path = require("path");
const ejs = require("ejs");
const mongoose = require("mongoose");
const Scores = require("./models/Scores");
const math = require("./public/js/math");

mongoose.connect("mongodb://localhost:27017/dbscores");

app.set("view engine", "ejs");

app.use(express.static("public"));

app.listen(3000, () => {
	console.log("App listening on http://localhost:3000");
});

app.get("/", (req, res) => {
	res.render("index");
});

app.get("/scores", async (req, res) => {
	const scores = await Scores.find({});
	res.render("scores", {
		scores: scores,
	});
});

app.get("/dashboard", async (req, res) => {
	const scores = await Scores.find({});

	// Helper function for sorting
	const sort_by = (field, reverse, primer) => {
		const key = primer ? (x) => primer(x[field]) : (x) => x[field];
		reverse = !reverse ? 1 : -1;
		return (a, b) => {
			const A = key(a);
			const B = key(b);
			return reverse * ((A > B) - (B > A));
		};
	};

	// Sum up pretest and posttest scores
	const total_pretest = scores.reduce(
		(acc, score) => acc + BigInt(score.pretest),
		0n
	);
	const total_posttest = scores.reduce(
		(acc, score) => acc + BigInt(score.posttest),
		0n
	);

	// Calculate averages
	const average_pretest = total_pretest / BigInt(scores.length);
	const average_posttest = total_posttest / BigInt(scores.length);

	// Variance and standard deviation
	const variance_pretest =
		scores.reduce(
			(acc, score) => acc + (BigInt(score.pretest) - average_pretest) ** 2n,
			0n
		) / BigInt(scores.length);
	const variance_posttest =
		scores.reduce(
			(acc, score) => acc + (BigInt(score.posttest) - average_posttest) ** 2n,
			0n
		) / BigInt(scores.length);

	const stddev_pretest = Math.sqrt(Number(variance_pretest));
	const stddev_posttest = Math.sqrt(Number(variance_posttest));

	// Correlation calculation (Pearson)
	let sumXY = 0,
		sumX = 0,
		sumY = 0,
		sumX2 = 0,
		sumY2 = 0,
		n = scores.length;
	for (let score of scores) {
		let x = parseInt(score.pretest);
		let y = parseInt(score.posttest);
		sumXY += x * y;
		sumX += x;
		sumY += y;
		sumX2 += x * x;
		sumY2 += y * y;
	}
	const correlation =
		(n * sumXY - sumX * sumY) /
		Math.sqrt((n * sumX2 - sumX ** 2) * (n * sumY2 - sumY ** 2));

	// Paired t-test calculation
	let sumDiff = 0,
		sumDiffSq = 0;
	for (let score of scores) {
		let diff = parseInt(score.posttest) - parseInt(score.pretest);
		sumDiff += diff;
		sumDiffSq += diff ** 2;
	}
	const meanDiff = sumDiff / n;
	const varianceDiff = (sumDiffSq - sumDiff ** 2 / n) / (n - 1); // Sample variance of differences
	const stddevDiff = Math.sqrt(varianceDiff);
	const tValue = meanDiff / (stddevDiff / Math.sqrt(n));

	// Sorting scores by pretest for median
	scores.sort(sort_by("pretest", true, parseInt));
	const mid = Math.floor(scores.length / 2);

	res.render("dashboard", {
		scores,
		total_pretest,
		total_posttest,
		average_pretest,
		average_posttest,
		variance_pretest,
		variance_posttest,
		stddev_pretest,
		stddev_posttest,
		median_pretest: scores[mid].pretest,
		median_posttest: scores[mid].posttest,
		correlation, // Added correlation value
		tValue, // Added t-test result
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
