import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Setup in-memory MongoDB server for testing
// General structure generated with the help of AI

let mongoServer;

// Create an in-memory MongoDB instance
export const createTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  return mongoServer.getUri();
};

// Connect to the in-memory MongoDB instance
export const connectTestDB = async (uri) => {
  await mongoose.connect(uri);
};

// Close the connection and stop the in-memory MongoDB instance
export const closeTestDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
      mongoServer = null;
    }
    console.log("Test DB fully closed");
  } catch (err) {
    console.warn("Error closing test DB:", err.message);
  }
};

// Clear all data from the in-memory MongoDB instance
export const clearTestDB = async () => {
  const conn = mongoose.connection;

  if (!conn) {
    console.warn("No mongoose connection object found");
    return;
  }

  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (conn.readyState === 1) {
    const collections = Object.keys(conn.collections);
    for (const name of collections) {
      await conn.collections[name].deleteMany({});
    }
    console.log("Test DB cleared");
  }
  // else if (conn.readyState === 2) {
  //   console.warn("Mongoose still connecting — skipping clear for now");
  // } else if (conn.readyState === 3) {
  //   console.warn("Mongoose disconnecting — skipping clear");
  // } else {
  //   console.warn(
  //     "No active test DB connection to clear (readyState:",
  //     conn.readyState,
  //     ")"
  //   );
  // }
};
