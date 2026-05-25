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

const MONGOOSE_OPTIONS: mongoose.ConnectOptions = {
  dbName: 'bluezoid',
  bufferCommands: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10_000,
  connectTimeoutMS: 10_000,
  socketTimeoutMS: 30_000,
  tls: true,
};

async function connect(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI environment variable is not set');

  if (mongoose.connection.readyState === 1) return mongoose;

  if (mongoose.connection.readyState === 2) {
    await new Promise<void>((resolve, reject) => {
      mongoose.connection.once('connected', resolve);
      mongoose.connection.once('error', reject);
    });
    return mongoose;
  }

  return mongoose.connect(uri, MONGOOSE_OPTIONS);
}

function createConnection(): Promise<typeof mongoose> {
  const promise = connect();
  promise.catch(() => { global._mongooseConnection = undefined; });
  return promise;
}

// Lazily initialised — never called at module evaluation time so `next build`
// succeeds without MONGODB_URI present in the build environment.
let mongoosePromise: Promise<typeof mongoose> | null = null;

export async function connectMongoose(): Promise<typeof mongoose> {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongooseConnection) {
      global._mongooseConnection = createConnection();
    }
    return global._mongooseConnection;
  }
  if (!mongoosePromise) mongoosePromise = createConnection();
  return mongoosePromise;
}
