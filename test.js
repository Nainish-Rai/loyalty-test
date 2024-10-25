const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"; // Replace with your MongoDB connection string
const DB_NAME = "loyalty-program"; // Replace with your database name
const COLLECTION_NAME = "loyalty-points"; // Replace with your collection name

let db; // Variable to hold the database connection

// Connect to MongoDB
MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true })
  .then((client) => {
    console.log("Connected to MongoDB");
    db = client.db(DB_NAME);
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Middleware to validate API key
const validateApiKey = (req, res, next) => {
  const apiKey = req.header("API-KEY");
  if (!apiKey || apiKey !== "123456789") {
    return res.status(403).json({ message: "Forbidden: Invalid API key." });
  }
  next();
};

// GET /loyalty/points - Retrieve loyalty points for a consumer
app.get("/loyalty/points", validateApiKey, async (req, res) => {
  const companyId = req.query.companyId;
  const email = req.query.email;

  if (!companyId || !email) {
    return res
      .status(400)
      .json({ message: "Company ID and email query parameters are required." });
  }

  try {
    const companyDoc = await db
      .collection(COLLECTION_NAME)
      .findOne({ companyId });
    if (!companyDoc) {
      return res.status(404).json({ message: "Company not found." });
    }

    const customer = companyDoc.customers.find(
      (customer) => customer.email === email
    );
    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    res.status(200).json(customer.points); // Send only the points array
  } catch (err) {
    console.error("Error fetching loyalty points:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// PUT /loyalty/points - Update or add loyalty points for a consumer
app.put("/loyalty/points", validateApiKey, async (req, res) => {
  const companyId = req.query.companyId;
  const email = req.query.email;
  const { points, expiry } = req.body;

  if (!companyId || !email || points === undefined || !expiry) {
    return res
      .status(400)
      .json({ message: "Company ID, email, points, and expiry are required." });
  }

  try {
    // Find existing company document
    const companyDoc = await db
      .collection(COLLECTION_NAME)
      .findOne({ companyId });
    if (!companyDoc) {
      return res.status(404).json({ message: "Company not found." });
    }

    // Find existing customer within the company document
    const customer = companyDoc.customers.find(
      (customer) => customer.email === email
    );
    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    // Calculate the current total points
    const currentPoints = customer.points.reduce(
      (total, entry) => total + entry.points,
      0
    );

    // Check if the new total would be negative
    if (currentPoints + points < 0) {
      return res
        .status(400)
        .json({ message: "Total points cannot be negative." });
    }

    // Update the customer's points within the company document
    const updateResult = await db.collection(COLLECTION_NAME).updateOne(
      { companyId, "customers.email": email },
      {
        $push: { "customers.$.points": { points, expiry: new Date(expiry) } },
      }
    );

    res.status(200).json({ message: "Loyalty points updated successfully." });
  } catch (err) {
    console.error("Error updating loyalty points:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});
