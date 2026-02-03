import { Router } from 'express';
import docsRoutes from './docs';
import institutionRoutes from './institutions';
import programRoutes from './programs';
import searchRoutes from './search';

const router = Router();

router.use('/institutions', institutionRoutes);
router.use('/programs', programRoutes);
router.use('/search', searchRoutes);
router.use('/docs', docsRoutes);

export default router;
