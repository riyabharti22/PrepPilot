import mongoose from "mongoose";

let isConnected = false;
let connectionAttempted = false;

export async function connectDB() {
  connectionAttempted = true;
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn(
      "[DB] No MONGODB_URI set. Running in IN-MEMORY FALLBACK mode - data will not persist across restarts."
    );
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log("[DB] Connected to MongoDB");
    return true;
  } catch (err) {
    console.error(
      "[DB] Could not connect to MongoDB - falling back to IN-MEMORY mode. Reason:",
      err.message
    );
    isConnected = false;
    return false;
  }
}

export function dbIsConnected() {
  return isConnected;
}

export function dbWasAttempted() {
  return connectionAttempted;
}
