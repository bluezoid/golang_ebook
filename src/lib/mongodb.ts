import { MongoClient, type MongoClientOptions } from 'mongodb';

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI!;

const options: MongoClientOptions = {
  tls: true,
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
};

function createClientPromise(): Promise<MongoClient> {
  const client = new MongoClient(uri, options);
  const promise = client.connect();
  // Clear the cached promise on failure so the next request gets a fresh connection
  promise.catch(() => { global._mongoClientPromise = undefined; });
  return promise;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientPromise();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = createClientPromise();
}

export default clientPromise;
