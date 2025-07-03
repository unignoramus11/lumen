/**
 * @file This file establishes and manages the MongoDB database connection for the application.
 * It uses Mongoose as an ODM and implements a caching mechanism to reuse database connections
 * across multiple requests, optimizing performance and resource utilization.
 */

import mongoose from "mongoose";

/**
 * Retrieves the MongoDB connection URI from environment variables.
 * Throws an error if the `MONGODB_URI` environment variable is not defined,
 * ensuring that the application cannot start without a proper database configuration.
 * @type {string}
 */
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

/**
 * Interface for the cached database connection.
 * This helps in storing and retrieving the Mongoose connection promise and object,
 * preventing redundant connections.
 * @property {typeof mongoose | null} conn - The established Mongoose connection object, or null if not yet connected.
 * @property {Promise<typeof mongoose> | null} promise - The promise that resolves to the Mongoose connection, or null.
 */
interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/**
 * Global cache for the Mongoose connection.
 * This ensures that the connection is persisted across hot reloads in development
 * and reused efficiently in production environments.
 * @type {Cached}
 */
let cached: Cached = (global as typeof global & { mongoose?: Cached })
  .mongoose || { conn: null, promise: null };

// Initialize the cache if it doesn't exist on the global object.
if (!cached) {
  cached = (global as typeof global & { mongoose?: Cached }).mongoose = {
    conn: null,
    promise: null,
  };
}

/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * It first checks if a connection already exists in the cache; if so, it returns the cached connection.
 * Otherwise, it initiates a new connection, caches the promise, and returns the resolved connection.
 * This function is designed to be idempotent and efficient for database access.
 * @returns {Promise<typeof mongoose>} A promise that resolves to the Mongoose connection object.
 * @throws {Error} If the MongoDB connection fails.
 */
async function dbConnect(): Promise<typeof mongoose> {
  // If a connection is already cached, return it immediately.
  if (cached.conn) {
    return cached.conn;
  }

  // If there's no pending connection promise, create a new one.
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable Mongoose's internal buffering
    };

    // Connect to MongoDB and cache the promise.
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    // Await the connection promise and store the resolved connection.
    cached.conn = await cached.promise;
  } catch (e) {
    // If connection fails, clear the cached promise to allow retries.
    cached.promise = null;
    throw e; // Re-throw the error for upstream handling.
  }

  return cached.conn; // Return the established connection.
}

export default dbConnect;
