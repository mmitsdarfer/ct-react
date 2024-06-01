import express from "express";
import cors from "cors";
import "express-async-errors";
//import posts from "./routes/posts.mjs";
import mlb from './routes/mlb.js';
import nhl from './routes/nhl.js';
import nfl from './routes/nfl.js';
import nba from './routes/nba.js';
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

// Load the /posts routes
//app.use("/posts", posts);
app.use('/mlb', mlb);
app.use('/nhl', nhl);
app.use('/nfl', nfl);
app.use('/nba', nba);

// Global error handling
app.use((err, _req, res, next) => {
  res.status(500).send("Uh oh! An unexpected error occured.")
})

// start the Express server
app.listen(PORT, () => {
  console.log(`DB running on ${PORT}`);
});
