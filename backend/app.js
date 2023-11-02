import express from 'express'
import movies from "./routes/movies.js";
import users from "./routes/users.js";
import comments from "./routes/comments.js";
const app = express()
const port = 3000



app.use(express.json());

// Load the /movies routes
app.use("/movies", movies);

// Load the /users routes
app.use("/users", users);

// Load the /users routes
app.use("/comments", comments);

app.listen(port, () => {
	console.log(`backend listening on port ${port}`)
})
