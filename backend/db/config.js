import { MongoClient } from "mongodb";
const connectionString = DB_LINK;
const client = new MongoClient(connectionString);
let conn;
try {
	conn = await client.connect();
} catch(e) {
	console.error(e);
}
// Database name
let db = conn.db("ADADProject");
export default db;

