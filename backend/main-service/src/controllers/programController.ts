import { Request, Response, NextFunction } from 'express';
import Program from '../models/Program';

export async function listPrograms(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            page = 1,
            limit = 20,
            institution_id,
            name,
            level,
            duration,
            delivery_mode,
            eligibility,
            specializations,
            sort = 'name:asc',
        } = req.query;
        const filter: any = {};
        if (institution_id) filter.institution_id = institution_id;
        if (name) filter.name = { $regex: name, $options: 'i' };
        if (level) filter.level = level;
        if (duration) filter['duration'] = { $regex: duration, $options: 'i' };
        if (delivery_mode) filter.delivery_mode = delivery_mode;
        if (eligibility) filter['eligibility'] = { $regex: eligibility, $options: 'i' };
        if (specializations) {
            if (Array.isArray(specializations)) {
                filter.specializations = { $in: specializations };
            } else {
                filter.specializations = specializations;
            }
        }
        const [sortField, sortOrder] = (sort as string).split(':');
        const sortObj: any = { [sortField]: sortOrder === 'desc' ? -1 : 1 };
        const programs = await Program.find(filter)
            .sort(sortObj)
            .skip((+page - 1) * +limit)
            .limit(+limit);
        const total = await Program.countDocuments(filter);
        res.json({
            data: programs,
            pagination: { page: +page, limit: +limit, total, total_pages: Math.ceil(total / +limit) },
        });
    } catch (err) { next(err); }
}

export async function createProgram(req: Request, res: Response, next: NextFunction) {
    try {
        const program = new Program(req.body);
        await program.save();
        res.status(201).json(program);
    } catch (err) { next(err); }
}

export async function getProgram(req: Request, res: Response, next: NextFunction) {
    try {
        const program = await Program.findById(req.params.programId);
        if (!program) return res.status(404).json({ error: 'NotFound', message: 'Program not found' });
        res.json(program);
    } catch (err) { next(err); }
}

export async function updateProgram(req: Request, res: Response, next: NextFunction) {
    try {
        const program = await Program.findByIdAndUpdate(
            req.params.programId,
            req.body,
            { new: true, runValidators: true },
        );
        if (!program) return res.status(404).json({ error: 'NotFound', message: 'Program not found' });
        res.json(program);
    } catch (err) { next(err); }
}

export async function patchProgram(req: Request, res: Response, next: NextFunction) {
    try {
        const program = await Program.findByIdAndUpdate(
            req.params.programId,
            { $set: req.body },
            { new: true, runValidators: true },
        );
        if (!program) return res.status(404).json({ error: 'NotFound', message: 'Program not found' });
        res.json(program);
    } catch (err) { next(err); }
}

export async function deleteProgram(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await Program.findByIdAndDelete(req.params.programId);
        if (!result) return res.status(404).json({ error: 'NotFound', message: 'Program not found' });
        res.status(204).send();
    } catch (err) { next(err); }
}
