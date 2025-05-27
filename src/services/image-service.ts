// src/services/image-service.ts
'use server';

import { MongoClient, ObjectId, Db, Collection } from 'mongodb';

const uri = process.env.MONGODB_URI;
let client: MongoClient | null = null;
let db: Db | null = null;

if (!uri) {
  console.warn(
    "CRITICAL: MONGODB_URI environment variable is not set. Image service will NOT connect to the database. Please ensure this is set in your .env file (e.g., MONGODB_URI=your_uri_here)."
  );
}

async function connectToDb(): Promise<Db | null> {
  // If client exists and is connected, return existing db instance
  if (db && client && client.topology && client.topology.isConnected()) {
    return db;
  }
  if (!uri) {
    console.error("MongoDB URI is not configured. Cannot connect to DB.");
    return null;
  }
  try {
    // Create a new client if one doesn't exist or if the existing one is closed
    if (!client || (client.topology && !client.topology.isConnected())) {
        console.log("MongoDB client not connected or doesn't exist, creating new client.");
        client = new MongoClient(uri);
        await client.connect();
        console.log("Successfully connected to MongoDB.");
    }
    // If client exists but db is not set (should not happen if client is connected above, but as a safeguard)
    if (client && !db) {
        db = client.db("ethereal_embrace_gallery"); // Use your preferred DB name
    } else if (client && db && client.db().databaseName !== "ethereal_embrace_gallery") {
        // If somehow connected to a different DB, switch to the correct one
        db = client.db("ethereal_embrace_gallery");
    }
    
    return db;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        console.error("Failed to close MongoDB client after connection error:", closeError);
      }
      client = null; // Reset client
      db = null;     // Reset db
    }
    return null;
  }
}

export interface StoredImage {
  id: string; // ObjectId.toString()
  imageDataUri: string;
  prompt: string;
  memoryId?: string;
  createdAt: Date;
}

// For raw DB documents before mapping _id
interface RawStoredImage {
  _id?: ObjectId; // MongoDB's default ID field
  imageDataUri: string;
  prompt: string;
  memoryId?: string;
  createdAt: Date;
}

const GENERATED_IMAGES_COLLECTION = "generated_images";
const MEMORY_IMAGES_COLLECTION = "memory_images";

function mapRawImageToStoredImage(rawImageWithId: RawStoredImage & { _id: ObjectId }): StoredImage {
  const { _id, ...rest } = rawImageWithId;
  return {
    ...rest,
    id: _id.toString(),
    createdAt: new Date(rest.createdAt), // Ensure createdAt is a Date object
  };
}

export async function saveImageToDb(imageDataUri: string, prompt: string): Promise<StoredImage | null> {
  const database = await connectToDb();
  if (!database) {
    console.error("DB not connected. Cannot save image.");
    return null;
  }
  try {
    const collection: Collection<RawStoredImage> = database.collection(GENERATED_IMAGES_COLLECTION);
    const docToInsert: RawStoredImage = {
      imageDataUri,
      prompt,
      createdAt: new Date(),
    };
    const result = await collection.insertOne(docToInsert);
    if (result.insertedId) {
        console.log("Image saved to DB with ID:", result.insertedId.toString());
        return mapRawImageToStoredImage({ ...docToInsert, _id: result.insertedId });
    }
    return null;
  } catch (error) {
    console.error("Error saving image to DB:", error);
    return null;
  }
}

export async function getAllImagesFromDb(): Promise<StoredImage[]> {
  const database = await connectToDb();
  if (!database) {
    console.error("DB not connected. Cannot get all images.");
    return [];
  }
  try {
    const collection: Collection<RawStoredImage> = database.collection(GENERATED_IMAGES_COLLECTION);
    const rawImages = await collection.find({}).sort({ createdAt: -1 }).toArray();
    // Filter out any potential nulls if _id was somehow missing, though unlikely for inserts
    return rawImages.filter(img => img._id).map(img => mapRawImageToStoredImage(img as RawStoredImage & { _id: ObjectId }));
  } catch (error) {
    console.error("Error fetching images from DB:", error);
    return [];
  }
}

export async function saveImageForMemory(memoryId: string, imageDataUri: string, prompt: string): Promise<StoredImage | null> {
  const database = await connectToDb();
  if (!database) {
    console.error(`DB not connected. Cannot save image for memory ${memoryId}.`);
    return null;
  }
  try {
    const collection: Collection<RawStoredImage> = database.collection(MEMORY_IMAGES_COLLECTION);
    const docToUpsert: RawStoredImage = { 
        imageDataUri, 
        prompt, 
        createdAt: new Date(), 
        memoryId 
    };
    const result = await collection.updateOne(
      { memoryId },
      { $set: docToUpsert },
      { upsert: true }
    );
    
    let imageId: ObjectId | undefined;
    if (result.upsertedId) {
        imageId = result.upsertedId;
    } else {
        const existingDoc = await collection.findOne({ memoryId });
        imageId = existingDoc?._id;
    }

    if (imageId) {
        console.log(`Image for memory ${memoryId} saved/updated in DB. Image ID: ${imageId.toString()}`);
        return mapRawImageToStoredImage({ ...docToUpsert, _id: imageId, memoryId });
    }
    return null;

  } catch (error) {
    console.error(`Error saving image for memory ${memoryId} to DB:`, error);
    return null;
  }
}

export async function getImageForMemory(memoryId: string): Promise<StoredImage | null> {
  const database = await connectToDb();
  if (!database) {
    console.error(`DB not connected. Cannot get image for memory ${memoryId}.`);
    return null;
  }
  try {
    const collection: Collection<RawStoredImage> = database.collection(MEMORY_IMAGES_COLLECTION);
    const rawImage = await collection.findOne({ memoryId });
    return rawImage && rawImage._id ? mapRawImageToStoredImage(rawImage as RawStoredImage & { _id: ObjectId }) : null;
  } catch (error) {
    console.error(`Error fetching image for memory ${memoryId} from DB:`, error);
    return null;
  }
}
