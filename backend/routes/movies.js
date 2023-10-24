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
	let results = await db.collection('movies').insertOne(document);
	res.send(results).status(200);
})

//retrieves movie by _id
router.get("/:id", async (req, res) => {
	var id = new ObjectId(req.params.id);
	let results = await db.collection('movies').find({ "_id": id


	}).toArray();
	res.send(results).status(200);


})

//remove movie by _id
router.get("/:id", async (req, res) => {
	var id = new ObjectId(req.params.id);
	let results = await db.collection('movies').find({ "_id": id


	}).toArray();
	res.send(results).status(200);


})


export default router;
