import { Request, Response, NextFunction } from 'express';
import DegreeProgram from '../models/DegreeProgram';

export async function listDegreePrograms(req: Request, res: Response, next: NextFunction) {
    try {
        const { page = 1, limit = 20, title, stream, sort = 'title:asc' } = req.query;
        const filter: any = {};
        if (title) filter.title = { $regex: title, $options: 'i' };
        if (stream) filter.stream = stream;
        const [sortField, sortOrder] = (sort as string).split(':');
        const sortObj: any = { [sortField]: sortOrder === 'desc' ? -1 : 1 };
        const programs = await DegreeProgram.find(filter)
            .sort(sortObj)
            .skip((+page - 1) * +limit)
            .limit(+limit);
        const total = await DegreeProgram.countDocuments(filter);
        res.json({
            data: programs,
            pagination: { page: +page, limit: +limit, total, total_pages: Math.ceil(total / +limit) },
        });
    } catch (err) { next(err); }
}

export async function createDegreeProgram(req: Request, res: Response, next: NextFunction) {
    try {
        const program = new DegreeProgram(req.body);
        await program.save();
        res.status(201).json(program);
    } catch (err) { next(err); }
}

export async function getDegreeProgram(req: Request, res: Response, next: NextFunction) {
    try {
        const program = await DegreeProgram.findById(req.params.degreeProgramId);
        if (!program) return res.status(404).json({ error: 'NotFound', message: 'Degree program not found' });
        res.json(program);
    } catch (err) { next(err); }
}

export async function updateDegreeProgram(req: Request, res: Response, next: NextFunction) {
    try {
        const program = await DegreeProgram.findByIdAndUpdate(req.params.degreeProgramId, req.body, { new: true });
        if (!program) return res.status(404).json({ error: 'NotFound', message: 'Degree program not found' });
        res.json(program);
    } catch (err) { next(err); }
}

export async function patchDegreeProgram(req: Request, res: Response, next: NextFunction) {
    try {
        const program = await DegreeProgram.findByIdAndUpdate(req.params.degreeProgramId, req.body, { new: true });
        if (!program) return res.status(404).json({ error: 'NotFound', message: 'Degree program not found' });
        res.json(program);
    } catch (err) { next(err); }
}

export async function deleteDegreeProgram(req: Request, res: Response, next: NextFunction) {
    try {
        const program = await DegreeProgram.findByIdAndDelete(req.params.degreeProgramId);
        if (!program) return res.status(404).json({ error: 'NotFound', message: 'Degree program not found' });
        res.status(204).send();
    } catch (err) { next(err); }
}
