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
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) await mongoServer.stop();
};

// Clear all data from the in-memory MongoDB instance
export const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
};
