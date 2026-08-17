import mongoose from 'mongoose';
import dns from 'dns';

export async function connectToDatabase(mongoUri) {
  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined');
  }

  // Fallback DNS if system returns localhost (prevents SRV resolution failure on Windows)
  try {
    const servers = dns.getServers();
    if (servers.length === 1 && servers[0] === '127.0.0.1') {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    }
  } catch (e) {
    // Ignore setting DNS servers error
  }

  const connectionOptions = {
    // Mongoose v7+ uses stable defaults; keep explicit for clarity
    autoIndex: true,
    maxPoolSize: 100,
    minPoolSize: 10,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 10000,
  };

  try {
    await mongoose.connect(mongoUri, connectionOptions);
    const { host, name } = mongoose.connection;
    // eslint-disable-next-line no-console
    console.log(`MongoDB connected: ${host}/${name}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
}

export default mongoose;

