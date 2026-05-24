/**
 * Mongoose singleton for Next.js.
 *
 * In development, hot-reload creates new module instances on every file save,
 * which would create a new Mongoose connection each time. We cache the promise
 * on the global object to prevent connection exhaustion.
 *
 * In production (Vercel serverless), each function invocation may or may not
 * share a process. Caching the promise on global handles both cases correctly.
 */
import mongoose from 'mongoose';

declare global {
  var _mongooseConnection: Promise<typeof mongoose> | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set');
}

const MONGOOSE_OPTIONS: mongoose.ConnectOptions = {
  dbName: 'bluezoid',
  bufferCommands: false,  // fail fast if not connected — no silent queuing
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10_000,
  connectTimeoutMS: 10_000,
  socketTimeoutMS: 30_000,
  // TLS required for Atlas
  tls: true,
};

async function connect(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (mongoose.connection.readyState === 2) {
    // Connecting — wait for it
    await new Promise<void>((resolve, reject) => {
      mongoose.connection.once('connected', resolve);
      mongoose.connection.once('error', reject);
    });
    return mongoose;
  }

  return mongoose.connect(MONGODB_URI, MONGOOSE_OPTIONS);
}

function createConnection(): Promise<typeof mongoose> {
  const promise = connect();
  promise.catch(() => {
    // Clear cache on failure so the next request attempts a fresh connection
    global._mongooseConnection = undefined;
  });
  return promise;
}

let mongoosePromise: Promise<typeof mongoose>;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongooseConnection) {
    global._mongooseConnection = createConnection();
  }
  mongoosePromise = global._mongooseConnection;
} else {
  mongoosePromise = createConnection();
}

export default mongoosePromise;

/**
 * Convenience helper — call at the top of every API route.
 * Returns the mongoose instance after ensuring a live connection.
 */
export async function connectMongoose(): Promise<typeof mongoose> {
  return mongoosePromise;
}
