import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import logger from './config/logger';
import { connectDB } from './config/db';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 5000;
let server: any;

connectDB()
    .then(() => {
        server = app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        logger.error('Failed to connect to DB', err);
        process.exit(1);
    });

const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    if (server) {
        server.close(() => {
            logger.info('HTTP server closed');
        });
    }
    try {
        await mongoose.disconnect();
        logger.info('MongoDB disconnected');
    } catch (err) {
        logger.error('Error disconnecting MongoDB', err);
    }
    process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
