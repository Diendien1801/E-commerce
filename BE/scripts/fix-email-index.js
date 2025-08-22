const mongoose = require("mongoose");
require("dotenv").config();

async function fixEmailIndex() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/myapp"
    );
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection("users");

    // Xóa index cũ
    try {
      await collection.dropIndex("email_1");
      console.log("Dropped email_1 index");
    } catch (err) {
      console.log("Index email_1 not found or already dropped");
    }

    // Tạo index mới
    await collection.createIndex({ email: 1 }, { unique: true, sparse: true });
    console.log("Created new sparse unique index for email");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixEmailIndex();
