
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';
import routes from './routes';
import logger from './config/logger';
import * as OpenApiValidator from 'express-openapi-validator';
import { Request, Response, NextFunction } from 'express';

const app = express();

app.use(express.json());
app.use(helmet());

// Allow CORS from any origin
app.use(cors());



// Enhanced request logger middleware using Winston
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
});


app.use(
    OpenApiValidator.middleware({
        apiSpec: __dirname + '/../openapi.yaml',
        validateRequests: true, // (default)
        validateResponses: false, // false by default
    }),
);
// OpenAPI error handler (for validation errors)
interface OpenApiError extends Error {
    status?: number;
    errors?: Array<{
        path: string;
        message: string;
        errorCode?: string;
    }>;
    message: string;
}

app.use((err: OpenApiError, req: Request, res: Response, next: NextFunction) => {
    if (err.status && err.errors) {
        res.status(err.status).json({
            message: err.message,
            errors: err.errors,
        });
    } else {
        next(err);
    }
});

app.use('/', routes);

app.use(errorHandler);

export default app;
