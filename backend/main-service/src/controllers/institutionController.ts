import { Request, Response, NextFunction } from 'express';
import Institution from '../models/Institution';
import Program from '../models/Program';

export async function listInstitutions(req: Request, res: Response, next: NextFunction) {
    try {
        const { page = 1, limit = 20, country, type, sort = 'name:asc' } = req.query;
        const filter: any = {};
        if (country) filter.country = country;
        if (type) filter.type = type;
        const [sortField, sortOrder] = (sort as string).split(':');
        const sortObj: any = { [sortField]: sortOrder === 'desc' ? -1 : 1 };
        const institutions = await Institution.find(filter)
            .sort(sortObj)
            .skip((+page - 1) * +limit)
            .limit(+limit);
        const total = await Institution.countDocuments(filter);
        res.json({
            data: institutions,
            pagination: { page: +page, limit: +limit, total, total_pages: Math.ceil(total / +limit) },
        });
    } catch (err) { next(err); }
}

export async function createInstitution(req: Request, res: Response, next: NextFunction) {
    try {
        const institution = new Institution(req.body);
        await institution.save();
        res.status(201).json(institution);
    } catch (err) { next(err); }
}

export async function getInstitution(req: Request, res: Response, next: NextFunction) {
    try {
        const institution = await Institution.findById(req.params.institutionId);
        if (!institution) return res.status(404).json({ error: 'NotFound', message: 'Institution not found' });
        res.json(institution);
    } catch (err) { next(err); }
}

export async function updateInstitution(req: Request, res: Response, next: NextFunction) {
    try {
        const institution = await Institution.findByIdAndUpdate(
            req.params.institutionId,
            req.body,
            { new: true, runValidators: true },
        );
        if (!institution) return res.status(404).json({ error: 'NotFound', message: 'Institution not found' });
        res.json(institution);
    } catch (err) { next(err); }
}

export async function patchInstitution(req: Request, res: Response, next: NextFunction) {
    try {
        const institution = await Institution.findByIdAndUpdate(
            req.params.institutionId,
            { $set: req.body },
            { new: true, runValidators: true },
        );
        if (!institution) return res.status(404).json({ error: 'NotFound', message: 'Institution not found' });
        res.json(institution);
    } catch (err) { next(err); }
}

export async function deleteInstitution(req: Request, res: Response, next: NextFunction) {
    try {
        const programs = await Program.find({ institution_id: req.params.institutionId });
        if (programs.length > 0) {
            return res.status(409).json({ error: 'Conflict', message: 'Cannot delete institution with associated programs' });
        }
        const result = await Institution.findByIdAndDelete(req.params.institutionId);
        if (!result) return res.status(404).json({ error: 'NotFound', message: 'Institution not found' });
        res.status(204).send();
    } catch (err) { next(err); }
}

export async function listInstitutionPrograms(req: Request, res: Response, next: NextFunction) {
    try {
        const { page = 1, limit = 20, level } = req.query;
        const filter: any = { institution_id: req.params.institutionId };
        if (level) filter.level = level;
        const programs = await Program.find(filter)
            .skip((+page - 1) * +limit)
            .limit(+limit);
        const total = await Program.countDocuments(filter);
        res.json({
            data: programs,
            pagination: { page: +page, limit: +limit, total, total_pages: Math.ceil(total / +limit) },
        });
    } catch (err) { next(err); }
}
