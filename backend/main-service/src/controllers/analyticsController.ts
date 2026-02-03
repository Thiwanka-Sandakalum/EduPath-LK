import { Request, Response, NextFunction } from 'express';
import ScholarshipViewDaily from '../models/ScholarshipViewDaily';

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

const buildLastNDays = (days: number) => {
    const today = new Date();
    const out: string[] = [];
    for (let i = days - 1; i >= 0; i -= 1) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        out.push(isoDay(d));
    }
    return out;
};

export async function trackScholarshipView(req: Request, res: Response, next: NextFunction) {
    try {
        const scholarshipId = String(req.params.scholarshipId || '').trim();
        if (!scholarshipId) {
            return res.status(400).json({ error: 'BadRequest', message: 'scholarshipId is required' });
        }

        const body = (req.body || {}) as { viewer_id?: unknown; session_id?: unknown };
        const viewerId = typeof body.viewer_id === 'string' ? body.viewer_id.trim() : '';
        const sessionId = typeof body.session_id === 'string' ? body.session_id.trim() : '';
        const viewerKey = (viewerId || sessionId || 'anonymous').slice(0, 256);

        const date = isoDay(new Date());

        await ScholarshipViewDaily.findOneAndUpdate(
            { scholarship_id: scholarshipId, date },
            {
                $inc: { views: 1 },
                $addToSet: { viewers: viewerKey },
                $setOnInsert: { created_at: new Date() },
                $set: { updated_at: new Date() },
            },
            { upsert: true },
        );

        return res.status(204).send();
    } catch (err) {
        next(err);
    }
}

export async function getScholarshipAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
        const scholarshipId = String(req.params.scholarshipId || '').trim();
        if (!scholarshipId) {
            return res.status(400).json({ error: 'BadRequest', message: 'scholarshipId is required' });
        }

        const last14 = buildLastNDays(14);

        const [totals] = await ScholarshipViewDaily.aggregate([
            { $match: { scholarship_id: scholarshipId } },
            {
                $group: {
                    _id: '$scholarship_id',
                    total_views: { $sum: '$views' },
                },
            },
        ]);

        const uniqueAgg = await ScholarshipViewDaily.aggregate([
            { $match: { scholarship_id: scholarshipId } },
            { $unwind: '$viewers' },
            { $group: { _id: '$viewers' } },
            { $count: 'unique' },
        ]);

        const totalViews = (totals?.total_views as number | undefined) ?? 0;
        const totalUniqueViewers = (uniqueAgg?.[0]?.unique as number | undefined) ?? 0;

        const dailyDocs = await ScholarshipViewDaily.find({
            scholarship_id: scholarshipId,
            date: { $in: last14 },
        }).select({ scholarship_id: 1, date: 1, views: 1, viewers: 1 });

        const dailyByDate = new Map<string, { views: number; unique_viewers: number }>();
        for (const doc of dailyDocs) {
            dailyByDate.set(String((doc as any).date), {
                views: Number((doc as any).views ?? 0),
                unique_viewers: Array.isArray((doc as any).viewers) ? (doc as any).viewers.length : 0,
            });
        }

        const last_14_days = last14.map((date) => ({
            date,
            views: dailyByDate.get(date)?.views ?? 0,
            unique_viewers: dailyByDate.get(date)?.unique_viewers ?? 0,
        }));

        return res.json({
            scholarship_id: scholarshipId,
            total_views: totalViews,
            total_unique_viewers: totalUniqueViewers,
            last_14_days,
        });
    } catch (err) {
        next(err);
    }
}
