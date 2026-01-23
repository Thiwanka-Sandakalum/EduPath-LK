import { Request, Response, NextFunction } from 'express';
import Program from '../models/Program';

export async function getDistinctValues(req: Request, res: Response, next: NextFunction) {
    try {
        const { field } = req.query;
        if (!field || typeof field !== 'string') {
            return res.status(400).json({ error: 'Field query parameter is required' });
        }
        const values = await Program.distinct(field);
        res.json({ values });
    } catch (err) {
        next(err);
    }
}
