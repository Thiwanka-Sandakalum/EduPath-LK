import courseOfferingRoutes from './courseOfferings';
import { Router } from 'express';
import docsRoutes from './docs';
import institutionRoutes from './institutions';
import programRoutes from './programs';
import searchRoutes from './search';
import universityRoutes from './universities';
import degreeProgramRoutes from './degreePrograms';
import analyticsRoutes from './analytics';

const router = Router();

router.use('/institutions', institutionRoutes);
router.use('/programs', programRoutes);
router.use('/universities', universityRoutes);
router.use('/degree-programs', degreeProgramRoutes);
router.use('/course-offerings', courseOfferingRoutes);
router.use('/search', searchRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/docs', docsRoutes);

export default router;
