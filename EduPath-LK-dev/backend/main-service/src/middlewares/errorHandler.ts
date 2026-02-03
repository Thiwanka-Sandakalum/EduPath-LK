import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    logger.error(err.stack || err.message || err);
    const status = err.status || 500;
    res.status(status).json({
        error: err.name || 'InternalError',
        message: err.message || 'Internal server error',
        details: err.details || undefined,
    });
}
