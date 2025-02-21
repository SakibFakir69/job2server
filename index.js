require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion,ObjectId } = require("mongodb");
const uri = "mongodb+srv://fakirsakib22232:nI3VAWDJIuwGLe4Y@cluster0.nmkfd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log("Connected to MongoDB");

    // Database and collection
    const taskDB = client.db("taskDB");
    const taskCollection = taskDB.collection("tasks");

    // POST - Add Task
    app.post("/tasks", async (req, res) => {
      try {
        const user = req.body;
        const result = await taskCollection.insertOne(user);
        console.log(result);
        
        console.log("Task added:", result);
        res.send(result);
      } catch (error) {
        console.error("Error adding task:", error.message);
        res.status(500).send({ error: "Internal Server Error" });
      }
    });

    // GET - Fetch Tasks
    app.get("/tasks", async (req, res) => {
      try {
        const result = await taskCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching tasks:", error.message);
        res.status(500).send({ error: "Internal Server Error" });
      }
    });


    app.put("/tasks/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const { category } = req.body;

        // Validate ObjectId
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid task ID" });
        }

        console.log(id, category);

        const result = await taskCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { category } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Task not found" });
        }

        console.log(`Task ${id} updated to category: ${category}`);
        res.json({ message: "Task updated successfully" });
      } catch (error) {
        console.error("Error updating task:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });






    // Ping MongoDB to verify connection
    await client.db("admin").command({ ping: 1 });
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
  }
}

// Run the server
run().catch(console.error);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
