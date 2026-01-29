
/**
 * MongoDB Atlas Data API Service
 * Handles cloud persistence for the Council Portal.
 */

const API_URL = (process.env as any).MONGODB_DATA_API_URL;
const API_KEY = (process.env as any).MONGODB_DATA_API_KEY;
const CLUSTER = (process.env as any).MONGODB_CLUSTER || 'Cluster0';
const DB_NAME = (process.env as any).MONGODB_DATABASE || 'CivicPulse';
const COLLECTION = 'portal_state';

interface MongoResponse {
  document?: any;
  documents?: any[];
  insertedId?: string;
  matchedCount?: number;
  modifiedCount?: number;
}

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Request-Headers': '*',
  'api-key': API_KEY,
};

/**
 * Checks if the MongoDB configuration is available.
 */
export const isMongoConfigured = (): boolean => {
  return !!(API_URL && API_KEY);
};

/**
 * Fetches the portal state from MongoDB.
 */
export const fetchPortalState = async (councilName: string): Promise<any | null> => {
  if (!isMongoConfigured()) return null;

  try {
    const response = await fetch(`${API_URL}/action/findOne`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        collection: COLLECTION,
        database: DB_NAME,
        dataSource: CLUSTER,
        filter: { councilId: councilName },
      }),
    });

    const result: MongoResponse = await response.json();
    return result.document || null;
  } catch (error) {
    console.error('MongoDB Fetch Error:', error);
    return null;
  }
};

/**
 * Upserts the portal state into MongoDB.
 */
export const savePortalState = async (councilName: string, data: any): Promise<boolean> => {
  if (!isMongoConfigured()) return false;

  try {
    const response = await fetch(`${API_URL}/action/updateOne`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        collection: COLLECTION,
        database: DB_NAME,
        dataSource: CLUSTER,
        filter: { councilId: councilName },
        update: {
          $set: {
            ...data,
            lastSynced: new Date().toISOString(),
          }
        },
        upsert: true,
      }),
    });

    const result: MongoResponse = await response.json();
    return !!(result.matchedCount || result.insertedId);
  } catch (error) {
    console.error('MongoDB Save Error:', error);
    return false;
  }
};
