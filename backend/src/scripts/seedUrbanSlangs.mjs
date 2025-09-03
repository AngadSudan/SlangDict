import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: path.resolve("backend/.env") });

// Import your Slang model
import Slang from "../models/Slang.js";

const __dirname = path.resolve();

// Path to JSON file
const slangsFilePath = path.join(__dirname, "/cleanSlangs.json");

// Seed function
async function seedSlangs() {
  try {
    const MONGO_URI = "mongodb+srv://genzadmin:PIVIhVXarTpmCPMh@cluster0.xx154hu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    if (!MONGO_URI) {
      throw new Error("❌ Missing MONGO_URI in .env file");
    }

    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    // Read JSON
    const data = fs.readFileSync(slangsFilePath, "utf-8");
    const slangs = JSON.parse(data);

    // Clear existing collection
    await Slang.deleteMany({});
    console.log("🧹 Cleared existing slangs");

    // Insert new clean slangs
    await Slang.insertMany(slangs);
    console.log(`🎉 Seeded ${slangs.length} clean Gen Z slangs into DB`);

    mongoose.connection.close();
    console.log("🔌 Disconnected from MongoDB");
  } catch (err) {
    console.error("❌ Error seeding slangs:", err);
    process.exit(1);
  }
}

seedSlangs();
