import mongoose from 'mongoose';
import logger from './logger';

export const connectDB = async () => {
    const uri = process.env.MONGO_URI || '';
    try {
        await mongoose.connect(uri);
        logger.info('MongoDB connected');
    } catch (err) {
        logger.error('MongoDB connection error', err);
        throw err;
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