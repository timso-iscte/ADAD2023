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
	try{
		let document = req.body;
		let results = await db.collection('movies').insertMany(document);
		res.send(results).status(200);
	}catch(error) {
		res.send("invalid object structure").status(400)
	}
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

// Return list of movies ordered by total number of
// ratings. Show movie information.
// :order - “asc” or “desc”
router.get("/ratings/:order", async (req, res) => {
    let sort =1;
    if(req.params.order === "des"){
        sort = -1;
    };
    let result = await db.collection('users').aggregate([
        {$unwind: "$movies"},
        {$group: {_id: "$movies.movieid",rating_counter:{ $count: {}}}},
        {$sort: { rating_counter: sort }},
        {$lookup:{from: "movies",localField: "_id",foreignField :"_id",as: "info"}},
        {$project: {_id: 0, "info.title": 1, "info.genres":1, rating_counter: 1} }
    ]).toArray();
    res.send(result).status(200);
});

// Return movies with most 5 stars. Show movie
// information
router.get("/star", async (req, res) => {
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

// Return total number of ratings of users between
// {min_age} and {max_age}
router.get("/top/age/:min_age-:max_age", async (req, res) => {

    var min_age = parseInt(req.params.min_age);
    var max_age = parseInt(req.params.max_age);

        let result = await db.collection('users').aggregate([
            {$match: { age:{$gte: min_age, $lte: max_age}}},
            {$project: { _id:0, numberComments:{ $size: "$movies"}}},
            {$group: {_id:null, totalComments: {$sum: "$numberComments"}}},
            {$project: { _id:0, totalComments:1}}

        ]).toArray();

        res.send(result).status(200);
});

// For each user return, _id, name, max_rating,
// min_rating and avg_rating. Sort by avg_rating
router.get("/users", async (req, res) => {

    let result = await db.collection('users').aggregate([

        {$unwind: "$movies"},
        {$group: {_id: "$_id", name:{ $first: "$name" }, max_rating: { $max: "$movies.rating" }, 
        min_rating: { $min: "$movies.rating" }, avg_rating: { $avg: "$movies.rating" }}},
        {$sort: {avg_rating: -1 }},
        {$project: {"_id": 1, "name": 1, "max_rating": 1, "min_rating": 1, "avg_rating": 1}}
    ]).toArray();

    res.send(result).status(200);
});


// List all movies that have comments. Sort by
// number of comments.
router.get("/comments", async (req, res) => {
	let results = await db.collection('comments').aggregate([
		{$group: {_id:"$movie_id", nmr_of_comments:{$sum:1}}},
		{$lookup: {from: "movies", localField: "_id", foreignField:"_id", as: "info"}},
		{$sort: {nmr_of_comments: -1}},
		{$project: {"_id":0, "info.title": 1, "nmr_of_comments":1}}
	]).toArray()
	res.send(results).status(200)

})

// Return number of ratings per occupation in
// descending order.
// Result should have “occupation” and “number of
// ratings”
router.get("/occupation", async (req, res) => {

    let result = await db.collection('users').aggregate([
        {$unwind: "$movies"},
        {$group: {_id: "$occupation", NumberRatings: {$sum:1}}},
        {$sort: {NumberRatings: -1 }},
        {$project: {"occupation": 1, "NumberRatings":1}}
    ]).toArray();

    res.send(result).status(200);
});

// Return list of top movies by {genre_name}. Include
// title and info of the movie
router.get("/genres/:genre_name", async (req, res) => {

    var movie_genre = req.params.genre_name;

    let result = await db.collection('users').aggregate([
		{$limit: 1000},
        {$unwind: "$movies"},
        {$lookup:{from: "movies",localField: "movies.movieid",foreignField :"_id",as: "info"}},
        {$match: {"info.genres": movie_genre}},
        {$group: {_id: "$movies.movieid", media_ratings:{ $avg: "$movies.rating"}}},
        {$lookup:{from: "movies",localField: "_id",foreignField :"_id",as: "info2"}},
        {$sort: {media_ratings: -1 }},
        {$project: {"_id": 0, "info2.title": 1, "media_ratings": 1}}
    ]).toArray();

    res.send(result).status(200);
});

// List of movies by {genre_name} and {year}
router.get("/genres/:genre_name/year/:year", async (req, res) => {

    var movie_genre = req.params.genre_name;
    var year = req.params.year;

    let result = await db.collection('movies').aggregate([
        {$match: {"genres": movie_genre, "year": year}},
    ]).toArray();

    res.send(result).status(200);
});

// For each movie that includes the original title in
// parenthesis, create a new field named
// “original_title” and return a list with all this movies
// in the response
router.get("/originaltitle", async (req, res) => {

    let result = await db.collection('movies').aggregate([

        {$addFields:{ original_title:{ $regexFind: {input: "$title",regex: /\(([^)]+)\)/}}}},
        {$match: {"original_title": {$exists: true}}},
        {$project: { _id: 0, title: 1,original_title: 1}},
        {$match: {original_title: { $ne: null }}},
        {$project: { _id: 0, title: 1,"original_title.match": 1}},     
         
    ]).toArray();
  
    res.send(result).status(200);
       });

// In a new collection named: “ratings_by_user” save
// all the ratings of each user.
router.post("/user/ratings", async (req, res) => {

    const myObject = {};

    let result = await db.collection('users').aggregate([

    
        {$limit: 40},
        {$unwind: "$movies"},
        {$lookup:{from: "movies",localField: "movies.movieid",foreignField :"_id",as: "info"}},
        {$group: {_id:"$_id", u_id:{$first:"$_id"}, u_name:{$first: "$name"},
        ratings:{ $push: {movie_id: "$movies.movieid", rating:"$movies.rating", movie_title: {$arrayElemAt:["$info.title", 0]}}}}},
        {$project: {_id: 0, u_id: 1, u_name: 1 , ratings: 1}},
        {$out: "ratings_by_user"},
 
         
    ]).toArray();
  
    res.send(result).status(200);
});

//retrieves movie by _id
// Include in the response the avg_score of the movie
// and a list of all comments

router.get("/:id", async (req, res) => {
	try{
	var id = new ObjectId(req.params.id);
	let results = await db.collection('movies').find(
		{"_id": id}
	).project(
		{"_id":0}
	).toArray();
	res.send(results).status(200);
	}catch(erros){
		res.send("invalid id").status(400)
	}
})

// remove movie by _id
router.delete("/:id", async (req, res) => {
	try{
		var id = new ObjectId(req.params.id);
		let results = await db.collection('movies').deleteOne(
		{"_id": id}
		);
	res.send(results).status(200);
		}catch(error){
			res.send("invalid id").status(400)
		}
	
})

// update movie
router.put("/:id", async (req, res) => {
	try{
	var id = new ObjectId(req.params.id);
	let document = req.body;
	let results = await db.collection('movies').updateOne(
		{"_id": id},
		{$set: document}
	);
	res.send(results).status(200)
	}catch(error){
		res.send("invalid id").status(400)
	}
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