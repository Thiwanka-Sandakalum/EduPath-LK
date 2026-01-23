import { Request, Response, NextFunction } from 'express';
import Institution from '../models/Institution';
import Program from '../models/Program';

export async function search(req: Request, res: Response, next: NextFunction) {
    try {
        const { q, type = 'all', page = 1, limit = 20 } = req.query;
        if (!q) return res.status(400).json({ error: 'BadRequest', message: 'Search query required' });
        const regex = new RegExp(q as string, 'i');
        let institutions: any[] = [], programs: any[] = [], total = 0;
        if (type === 'institutions' || type === 'all') {
            institutions = await Institution.find({ name: regex })
                .skip((+page - 1) * +limit)
                .limit(+limit);
            total += await Institution.countDocuments({ name: regex });
        }
        if (type === 'programs' || type === 'all') {
            programs = await Program.find({ name: regex })
                .skip((+page - 1) * +limit)
                .limit(+limit);
            total += await Program.countDocuments({ name: regex });
        }
        res.json({
            institutions,
            programs,
            pagination: { page: +page, limit: +limit, total, total_pages: Math.ceil(total / +limit) },
        });
    } catch (err) { next(err); }
}
