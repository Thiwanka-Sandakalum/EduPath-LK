import mongoose from 'mongoose';
import logger from './logger';

const redactMongoUri = (uri: string) => {
    const raw = (uri || '').trim();
    if (!raw) return '';
    try {
        const u = new URL(raw);
        if (u.username) u.username = '***';
        if (u.password) u.password = '***';
        return u.toString();
    } catch {
        // Best-effort redaction for non-standard URIs.
        return raw.replace(/:\/\/([^@]+)@/i, '://***:***@');
    }
};

export const connectDB = async () => {
    const uri = (process.env.MONGO_URI || process.env.MONGODB_URI || '').trim();
    if (!uri) {
        throw new Error('Missing MongoDB connection string: set MONGO_URI (or MONGODB_URI) in your environment');
    }
    logger.info(`Connecting to MongoDB... ${redactMongoUri(uri)}`);
    let timeout = 10; // try for up to 10 times (10 seconds)
    while (mongoose.connection.readyState === 0 && timeout > 0) {
        try {
            await mongoose.connect(uri);
            logger.info('MongoDB connected');
        } catch (err) {
            logger.error('MongoDB connection error, retrying...', err);
            timeout--;
            await new Promise(res => setTimeout(res, 1000));
        }
    }
    if (mongoose.connection.readyState === 0) {
        throw new Error('MongoDB connection failed after retries');
    }
};

export const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        logger.info('MongoDB disconnected');
    } catch (err) {
        logger.error('Error disconnecting MongoDB', err);
        throw err;
    }
}