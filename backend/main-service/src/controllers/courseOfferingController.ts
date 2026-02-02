import { Request, Response, NextFunction } from 'express';
import CourseOffering from '../models/CourseOffering';

export async function listCourseOfferings(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            page = 1,
            limit = 20,
            degree_program_id,
            university_id,
            academic_year,
            sort = '_id:asc',
            stream,
            degree,
            university,
            aptitude,
            medium,
            district,
            z_score,
            eligible_only
        } = req.query;
        const filter: any = {};
        if (degree_program_id) filter.degree_program_id = degree_program_id;
        if (university_id) filter.university_id = university_id;
        if (academic_year) filter.academic_year = academic_year;

        // Advanced filters using population and aggregation
        const matchDegree: any = {};
        if (stream) matchDegree.stream = stream;
        if (degree) matchDegree.title = degree;
        if (aptitude !== undefined) {
            const aptitudeValue = Array.isArray(aptitude) ? aptitude[0] : aptitude;
            matchDegree.aptitude_test_required = aptitudeValue === 'true';
        }
        if (medium) matchDegree.medium_of_instruction = medium;

        const matchUniversity: any = {};
        if (university) matchUniversity.name = university;

        // Eligibility filter
        let eligibilityDistrict = district;
        let eligibilityZ = z_score ? parseFloat(z_score as string) : undefined;
        let eligibleOnlyValue = Array.isArray(eligible_only) ? eligible_only[0] : eligible_only;
        let filterEligible = eligibleOnlyValue === 'true';

        // Build aggregation pipeline
        const pipeline: any[] = [
            { $match: filter },
            {
                $lookup: {
                    from: 'degree_programs',
                    localField: 'degree_program_id',
                    foreignField: '_id',
                    as: 'degree_program'
                }
            },
            { $unwind: '$degree_program' },
        ];
        if (Object.keys(matchDegree).length > 0) {
            pipeline.push({ $match: { 'degree_program': matchDegree } });
        }
        if (university) {
            pipeline.push({
                $lookup: {
                    from: 'universities',
                    localField: 'university_id',
                    foreignField: '_id',
                    as: 'university'
                }
            });
            pipeline.push({ $unwind: '$university' });
            pipeline.push({ $match: { 'university.name': university } });
        }
        // Eligibility filter by district/z_score
        if (eligibilityDistrict && eligibilityZ !== undefined) {
            pipeline.push({
                $addFields: {
                    cutoff: { $ifNull: [`$cutoff_marks.${eligibilityDistrict}`, null] }
                }
            });
            pipeline.push({ $match: { cutoff: { $lte: eligibilityZ } } });
        }
        // Only eligible
        if (filterEligible && eligibilityDistrict && eligibilityZ !== undefined) {
            pipeline.push({
                $addFields: {
                    eligible: { $lte: [`$cutoff_marks.${eligibilityDistrict}`, eligibilityZ] }
                }
            });
            pipeline.push({ $match: { eligible: true } });
        }
        // Pagination and sorting
        const [sortField, sortOrder] = (sort as string).split(':');
        const sortObj: any = { [sortField]: sortOrder === 'desc' ? -1 : 1 };
        pipeline.push({ $sort: sortObj });
        pipeline.push({ $skip: (+page - 1) * +limit });
        pipeline.push({ $limit: +limit });

        const offerings = await CourseOffering.aggregate(pipeline);
        // For total count, run the same pipeline without skip/limit
        const countPipeline = pipeline.filter((stage) => !('$skip' in stage) && !('$limit' in stage) && !('$sort' in stage));
        countPipeline.push({ $count: 'total' });
        const totalResult = await CourseOffering.aggregate(countPipeline);
        const total = totalResult[0]?.total || 0;
        res.json({
            data: offerings,
            pagination: { page: +page, limit: +limit, total, total_pages: Math.ceil(total / +limit) },
        });
    } catch (err) { next(err); }
}

export async function createCourseOffering(req: Request, res: Response, next: NextFunction) {
    try {
        const offering = new CourseOffering(req.body);
        await offering.save();
        res.status(201).json(offering);
    } catch (err) { next(err); }
}

export async function getCourseOffering(req: Request, res: Response, next: NextFunction) {
    try {
        const offering = await CourseOffering.findById(req.params.courseOfferingId);
        if (!offering) return res.status(404).json({ error: 'NotFound', message: 'Course offering not found' });
        res.json(offering);
    } catch (err) { next(err); }
}

export async function updateCourseOffering(req: Request, res: Response, next: NextFunction) {
    try {
        const offering = await CourseOffering.findByIdAndUpdate(req.params.courseOfferingId, req.body, { new: true });
        if (!offering) return res.status(404).json({ error: 'NotFound', message: 'Course offering not found' });
        res.json(offering);
    } catch (err) { next(err); }
}

export async function patchCourseOffering(req: Request, res: Response, next: NextFunction) {
    try {
        const offering = await CourseOffering.findByIdAndUpdate(req.params.courseOfferingId, req.body, { new: true });
        if (!offering) return res.status(404).json({ error: 'NotFound', message: 'Course offering not found' });
        res.json(offering);
    } catch (err) { next(err); }
}

export async function deleteCourseOffering(req: Request, res: Response, next: NextFunction) {
    try {
        const offering = await CourseOffering.findByIdAndDelete(req.params.courseOfferingId);
        if (!offering) return res.status(404).json({ error: 'NotFound', message: 'Course offering not found' });
        res.status(204).send();
    } catch (err) { next(err); }
}
