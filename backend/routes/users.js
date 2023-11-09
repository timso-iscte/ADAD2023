import express from "express";
import db from "../db/config.js";
import { ObjectId } from "mongodb";
const router = express.Router();


// return first 50 documents from users collection
router.get("/", async (req, res) => {
	let results = await db.collection('users').find({}).limit(50).toArray();
	res.send(results).status(200);
});

//POST a user
router.post("/", async (req, res) =>{
	try{
		let document = req.body;
		let results = await db.collection('users').insertMany(document);
		res.send(results).status(200);
	}catch{
		res.send("invalid object structure").status(400)
	}
})

//retrieves users by _id
router.get("/:id", async (req, res) => {
	try{
		var id = new ObjectId(req.params.id);
		let results = await db.collection('users').find(
			{ "_id": id}
		).project(
			{"_id":0}
		).toArray();
		res.send(results).status(200);
	}catch(error){
		res.send("invalid id").status(400)
	}
})

//remove user by _id
router.delete("/:id", async (req, res) => {
	try{
		var id = new ObjectId(req.params.id);
		let results = await db.collection('users').deleteOne({
			"_id": id
		});
		res.send(results).status(200);
	}catch(error){
		res.send("invalid id").status(400)
	}
})

//update user
router.put("/:id", async (req, res) => {
	try{
		var id = new ObjectId(req.params.id);
		let document = req.body;
		let results = await db.collection('users').updateOne(
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
// "name": "Yaeko Hassan",
//   "gender": "F",
//   "age": 95,
//   "occupation": "academic/educator",
//   "movies": [
//     {
//       "movieid": 1419,
//       "rating": 4,
//       "timestamp": 956714815
//     }]
// }