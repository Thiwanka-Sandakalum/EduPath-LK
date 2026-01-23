import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth';
import { createProgram, deleteProgram, getProgram, listPrograms, patchProgram, updateProgram } from '../controllers/programController';
import { getDistinctValues } from '../controllers/programDistinctController';

const router = Router();

router.get('/distinct', getDistinctValues);
router.get('/', listPrograms);
router.post('/', authenticateJWT, createProgram);
router.get('/:programId', getProgram);
router.put('/:programId', authenticateJWT, updateProgram);
router.patch('/:programId', authenticateJWT, patchProgram);
router.delete('/:programId', authenticateJWT, deleteProgram);

export default router;
