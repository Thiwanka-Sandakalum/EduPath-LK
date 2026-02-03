import { Request, Response, NextFunction } from 'express';
import University from '../models/University';

export async function listUniversities(req: Request, res: Response, next: NextFunction) {
    try {
        const { page = 1, limit = 20, type, location, sort = 'name:asc' } = req.query;
        const filter: any = {};
        if (type) filter.type = type;
        if (location) filter.location = location;
        const [sortField, sortOrder] = (sort as string).split(':');
        const sortObj: any = { [sortField]: sortOrder === 'desc' ? -1 : 1 };
        const universities = await University.find(filter)
            .sort(sortObj)
            .skip((+page - 1) * +limit)
            .limit(+limit);
        const total = await University.countDocuments(filter);
        res.json({
            data: universities,
            pagination: { page: +page, limit: +limit, total, total_pages: Math.ceil(total / +limit) },
        });
    } catch (err) { next(err); }
}

export async function createUniversity(req: Request, res: Response, next: NextFunction) {
    try {
        const university = new University(req.body);
        await university.save();
        res.status(201).json(university);
    } catch (err) { next(err); }
}

export async function getUniversity(req: Request, res: Response, next: NextFunction) {
    try {
        const university = await University.findById(req.params.universityId);
        if (!university) return res.status(404).json({ error: 'NotFound', message: 'University not found' });
        res.json(university);
    } catch (err) { next(err); }
}

export async function updateUniversity(req: Request, res: Response, next: NextFunction) {
    try {
        const university = await University.findByIdAndUpdate(req.params.universityId, req.body, { new: true });
        if (!university) return res.status(404).json({ error: 'NotFound', message: 'University not found' });
        res.json(university);
    } catch (err) { next(err); }
}

export async function patchUniversity(req: Request, res: Response, next: NextFunction) {
    try {
        const university = await University.findByIdAndUpdate(req.params.universityId, req.body, { new: true });
        if (!university) return res.status(404).json({ error: 'NotFound', message: 'University not found' });
        res.json(university);
    } catch (err) { next(err); }
}

export async function deleteUniversity(req: Request, res: Response, next: NextFunction) {
    try {
        const university = await University.findByIdAndDelete(req.params.universityId);
        if (!university) return res.status(404).json({ error: 'NotFound', message: 'University not found' });
        res.status(204).send();
    } catch (err) { next(err); }
}
