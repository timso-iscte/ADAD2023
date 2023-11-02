import express from "express";
import db from "../db/config.js";
import { ObjectId } from "mongodb";
const router = express.Router();

// return first 50 documents from comments collection
router.get("/", async (req, res) => {
	let results = await db.collection('comments').find({}).limit(50).toArray();
	res.send(results).status(200);
});

//POST a comment
router.post("/", async (req, res) =>{
	let document = req.body;
	let results = await db.collection('comments').insertMany(document);
	res.send(results).status(200);
})

//retrieves comments by _id
router.get("/:id", async (req, res) => {
	var id = new ObjectId(req.params.id);
	let results = await db.collection('comments').find(
		{ "_id": id}
	).project(
		{"_id":0}
	).toArray();
	res.send(results).status(200);
})

//remove comments by _id
router.delete("/:id", async (req, res) => {
	var id = new ObjectId(req.params.id);
	let results = await db.collection('comments').deleteOne({
		"_id": id
	});
	res.send(results).status(200);
})

//update comment
router.put("/:id", async (req, res) => {
	var id = new ObjectId(req.params.id);
	let document = req.body;
	let results = await db.collection('comments').updateOne(
		{"_id": id},
		{$set: document}
	);
	res.send(results).status(200)
})

export default router;


// {
//     "_id": 5,
//     "movie_id": 586,
//     "user_id": 1049,
//     "comment": "Maecenas ut massa quis augue luctus tincidunt. Nulla mollis molestie lorem. Quisque ut erat.",
//     "date": 1683141549000
//   }
