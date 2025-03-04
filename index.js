require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vyipd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    await client.db("novieDB").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    const movieCollection = client.db("movieDB").collection("movies");

    app.get("/movie", async (req, res) => {
      const { searchEmail, searchMovie } = req.query;

      const query = {};

      if (searchEmail) {
        query.email = searchEmail;
      }

      if (searchMovie) {
        query.title = { $regex: searchMovie, $options: "i" };
      }

      const options = {
        sort: { rate: -1 },
      };

      const result = await movieCollection.find(query, options).toArray();
      res.send(result);
    });

    app.get("/movie/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await movieCollection.findOne(query);
      res.send(result);
    });

    app.patch("/movie/:id", async (req, res) => {
      const id = req.params.id;
      const movie = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          poster: movie.poster,
          title: movie.title,
          genre: movie.genre,
          duration: movie.duration,
          year: movie.year,
          rate: movie.rate,
          summary: movie.summary,
        },
      };
      const result = await movieCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.patch("/favoritemovie/:id", async (req, res) => {
      const id = req.params.id;
      const { favorite } = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          favorite: favorite,
        },
      };

      const result = await movieCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.delete("/movie/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await movieCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/movie", async (req, res) => {
      const newMovie = req.body;
      const result = await movieCollection.insertOne(newMovie);
      res.send(result);
    });
  } catch (error) {
    console.log("Error Occure on", error);
  } finally {
    // await client.close();
  }
}
run();

app.listen(port, () => {
  console.log("App listining on port", port);
});
