import "node:process";
import mongoose from "mongoose";
import envConfig from "./envConfig.js";

const SESSION_EVENTS_COLLECTION = "sessionevents";
const CAP_SIZE_BYTES = 10 * 1024 * 1024;

const db = mongoose
  .connect(envConfig.dbUri, {
    readPreference: "secondaryPreferred",
    readConcernLevel: "majority",
    writeConcern: { w: "majority", j: true },
  })
  .then(async (conn) => {
    console.log("Connected to MongoDB");

    try {
      const collections = await conn.connection.db
        .listCollections({ name: SESSION_EVENTS_COLLECTION })
        .toArray();

      if (collections.length === 0) {
        await conn.connection.db.createCollection(SESSION_EVENTS_COLLECTION, {
          capped: true,
          size: CAP_SIZE_BYTES,
          max: 100_000,
        });
        console.log(
          `[DB] Created capped collection: ${SESSION_EVENTS_COLLECTION}`,
        );
      } else {
        console.log(
          `[DB] Capped collection ready: ${SESSION_EVENTS_COLLECTION}`,
        );
      }
    } catch (err) {
      console.warn("[DB] Could not ensure capped collection:", err.message);
    }
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

export default db;
