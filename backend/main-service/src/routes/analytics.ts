import { Router } from 'express';
import { getScholarshipAnalytics, trackScholarshipView } from '../controllers/analyticsController';

const router = Router();

// Public endpoints: client app sends view events.
router.post('/scholarships/:scholarshipId/view', trackScholarshipView);
router.get('/scholarships/:scholarshipId', getScholarshipAnalytics);

export default router;
