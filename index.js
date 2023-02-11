const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;

// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://TravelStar-Go:TravelStar-Go**@cluster0.gribm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();

    const database = client.db("TravelStar-Go");
    const servicesCollection = database.collection("services");
    const userBlogsCollection = database.collection("userBlogs");
    const usersCollection = database.collection("users");
    const reviewsCollection = database.collection("reviews");
    app.get("/services", async (req, res) => {
      const cursor = servicesCollection.find({});
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const count = await cursor.count();
      let result;
      if (page) {
        result = await cursor
          .skip(page * size)
          .limit(size)
          .toArray();
      } else {
        result = await cursor.toArray();
      }

      res.send({ result, count });
    });
    // app.get("/services", async (req, res) => {
    //   const cursor = servicesCollection.find({});
    //   const reviews = await cursor.toArray();
    //   res.json(reviews);
    // });
    app.put("/confirmation/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const updateDoc = { $set: { status: "Approved" } };
      const result = await servicesCollection.updateOne(query, updateDoc);
      res.json(result);
    });
    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find({});
      const users = await cursor.toArray();
      res.json(users);
    });
    // GET BOOKING
    app.get("/bookings", async (req, res) => {
      const cursor = bookingsCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    // GET SERVICE BY ID
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await servicesCollection.findOne(query);
      res.send(result);
    });
    app.get("/services", async (req, res) => {
      const email = req.query.email;
      const query = { admin: email };
      const orders = servicesCollection.find(query);
      const result = await orders.toArray();
      res.json(result);
    });
    // })
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      // console.log(user);
      let isAdmin;
      if (user?.role === "admin") {
        isAdmin = true;
      } else {
        isAdmin = false;
      }
      res.json({ admin: isAdmin });
    });
    app.get("/reviews", async (req, res) => {
      const cursor = reviewsCollection.find({});
      const reviews = await cursor.toArray();
      res.json(reviews);
    });
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
    });
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
      // console.log(result);
    });
    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await servicesCollection.insertOne(service);
      res.json(result);
    });

    app.post("/services/userBlogs", async (req, res) => {
      const booking = req.body;
      const result = await userBlogsCollection.insertOne(booking);
      res.json(result);
    });
    app.post("/addSReview", async (req, res) => {
      const result = await reviewCollection.insertOne(req.body);
      res.send(result);
    });
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      // console.log(review)
      const result = await reviewsCollection.insertOne(review);
      res.json(result);
    });
    // UPDATE API
    // DELETE API
    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await servicesCollection.deleteOne(query);
      res.json(result);
    });

    // DELETE BOOKING
    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingsCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    //  await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log("This server is running on port:", port);
});

//
//
