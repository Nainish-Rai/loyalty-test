// seed.js (new file for adding dummy data)
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"; // Replace with your MongoDB connection string
const DB_NAME = "loyalty-program"; // Replace with your database name
const COLLECTION_NAME = "loyalty-points"; // Replace with your collection name

async function addDummyData() {
  try {
    const client = await MongoClient.connect(MONGODB_URI, {
      useUnifiedTopology: true,
    });
    const db = client.db(DB_NAME);

    // Dummy data for Company A
    const companyA = {
      companyId: "CompanyA",
      customers: [
        {
          email: "anujkuma@monet.work",
          points: [
            { points: 700, expiry: new Date("2024-12-31") },
            { points: 300, expiry: new Date("2024-11-30") },
          ],
        },
        {
          email: "johndoe@example.com",
          points: [
            { points: 1200, expiry: new Date("2025-03-15") },
            { points: 750, expiry: new Date("2024-10-20") },
            { points: 200, expiry: new Date("2024-08-05") },
          ],
        },
      ],
    };

    // Dummy data for Company B
    const companyB = {
      companyId: "CompanyB",
      customers: [
        {
          email: "peterjones@companyb.org",
          points: [
            { points: 150, expiry: new Date("2023-12-28") }, // Expired points
            { points: 1000, expiry: new Date("2025-06-30") },
          ],
        },
        {
          email: "marybrown@companyb.com",
          points: [
            { points: 450, expiry: new Date("2024-07-01") },
            { points: 600, expiry: new Date("2025-01-15") },
          ],
        },
      ],
    };

    // Dummy data for Company C
    const companyC = {
      companyId: "CompanyC",
      customers: [
        {
          email: "janeDoe@companyc.net",
          points: [
            { points: 800, expiry: new Date("2024-09-01") },
            { points: 400, expiry: new Date("2025-02-20") },
          ],
        },
        {
          email: "johnSmith@companyc.io",
          points: [
            { points: 100, expiry: new Date("2023-11-15") }, // Expired points
            { points: 1200, expiry: new Date("2025-08-10") },
          ],
        },
      ],
    };

    // Insert dummy data for all companies
    const resultA = await db.collection(COLLECTION_NAME).insertOne(companyA);
    console.log(`Company A: 1 dummy document inserted`);

    const resultB = await db.collection(COLLECTION_NAME).insertOne(companyB);
    console.log(`Company B: 1 dummy document inserted`);

    const resultC = await db.collection(COLLECTION_NAME).insertOne(companyC);
    console.log(`Company C: 1 dummy document inserted`);

    client.close();
  } catch (err) {
    console.error("Error inserting dummy data:", err);
  }
}

addDummyData();
