import express from "express";
import db from "../db/config.js";
import { ObjectId } from "mongodb";
const router = express.Router();


// return first 50 documents from movies collection
router.get("/", async (req, res) => {
	let results = await db.collection('movies').find({}).limit(50).toArray();
	res.send(results).status(200);
});

//POST a movie
router.post("/", async (req, res) =>{
	let document = req.body;
	let results = await db.collection('movies').insertMany(document);
	res.send(results).status(200);
})

// Displays list of top scored movies (by average
// score), sorted in descending order. Show movie
// information (title, year, etc.) in the response.
// Limit to {num_movies}

router.get("/higher/:num_movies", async (req, res) => {
	var num_movies = parseInt(req.params.num_movies);
	let results = await db.collection('users').aggregate([
		
		{$project: {"movies":1}},
		{$unwind: "$movies"},
		{$group: {_id:"$movies.movieid", avg_rating:{$avg:"$movies.rating"}}},
		{$sort: {avg_rating:-1}},
		{$limit: num_movies},
		{$lookup: {from: "movies", localField: "_id", foreignField:"_id", as: "info"}},
		{$project: {"_id": 0, "info.title": 1, "info.year": 1, "info.genres": 1, "avg_rating": 1}}
		
	]).toArray()
	res.send(results).status(200)
})

// Return movies with most 5 stars. Show movie
// information
router.get("/stars", async (req, res) => {
	let results = await db.collection('users').aggregate([
		{$project: {"movies":1}},
		{$unwind: "$movies"},
		{$match: {"movies.rating": {$eq: 5}}},
		{$group: {_id:"$movies.movieid", nmr_of_5stars:{$sum:1}}},
		{$lookup: {from: "movies", localField: "_id", foreignField:"_id", as: "info"}},
		{$sort: {nmr_of_5stars: -1}},
		{$project: {"_id": 0, "info.title": 1, "info.year": 1, "info.genres": 1, "nmr_of_5stars": 1}}
	]).toArray()
	res.send(results).status(200)
})

//retrieves movie by _id
router.get("/:id", async (req, res) => {
	var id = new ObjectId(req.params.id);
	let results = await db.collection('movies').find(
		{"_id": id}
	).project(
		{"_id":0}
	).toArray();
	res.send(results).status(200);
})

// remove movie by _id
router.delete("/:id", async (req, res) => {
	var id = new ObjectId(req.params.id);
	let results = await db.collection('movies').deleteOne(
		{"_id": id}
	);
	res.send(results).status(200);
})

// update movie
router.put("/:id", async (req, res) => {
	var id = new ObjectId(req.params.id);
	let document = req.body;
	let results = await db.collection('movies').updateOne(
		{"_id": id},
		{document}   //not working
	);
	res.send(results).status(200)
})




export default router;

// {
// 	"title": "Minions",
// 	"genres": "Comedy",
// 	"year": "2015",
// 	"genre": [
// 		"Comedy"
// 	]
// }