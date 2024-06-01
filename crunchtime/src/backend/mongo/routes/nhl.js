import express from "express";
import db from "../conn.js";
import { ObjectId } from "mongodb";

const router = express.Router();
router.get("/", async (req, res) => {
    let collection = await db.collection("nhl");
    let results = await collection.find({})
      .limit(50)
      .toArray();
  
    res.send(results).status(200);
  });
  
  // Fetches the latest posts
  router.get("/latest", async (req, res) => {
    let collection = await db.collection("nhl");
    let results = await collection.aggregate([
      //{"$project": {"author": 1, "title": 1, "tags": 1, "date": 1}},
      {"$sort": {"date": -1}},  //sort by newest
      {"$limit": 1} //return 1 result
    ]).toArray();
    res.send(results).status(200);
  });
  
  // Get a single post
  router.get("/:id", async (req, res) => {
    let collection = await db.collection("nhl");
    let query = {_id: new ObjectId(req.params.id)};
    let result = await collection.findOne(query);
  
    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);
  });
  
  // Add a new document to the collection
  router.post("/", async (req, res) => {
    let collection = await db.collection("nhl");
    let newDocument = req.body;
    newDocument.date = new Date();
    let result = await collection.insertOne(newDocument);
    res.send(result).status(204);
  });
  
  // Delete an entry
  router.delete("/:id", async (req, res) => {
    const query = { _id: new ObjectId(req.params.id) };
  
    const collection = db.collection("nhl");
    let result = await collection.deleteOne(query);
  
    res.send(result).status(200);
  });

  //replace an entry (keep id, change values)
  router.patch("/:id", async (req, res) => {
    const query = { _id: new ObjectId(req.params.id) };
    const newData = req.body;
    newData.date = new Date();
  
    let collection = await db.collection("nhl");
    let result = await collection.replaceOne(query, newData);
  
    res.send(result).status(200);
  });

  export default router;