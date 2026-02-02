import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth';
import {
    listUniversities,
    createUniversity,
    getUniversity,
    updateUniversity,
    patchUniversity,
    deleteUniversity
} from '../controllers/universityController';

const router = Router();

router.get('/', listUniversities);
router.post('/', authenticateJWT, createUniversity);
router.get('/:universityId', getUniversity);
router.put('/:universityId', authenticateJWT, updateUniversity);
router.patch('/:universityId', authenticateJWT, patchUniversity);
router.delete('/:universityId', authenticateJWT, deleteUniversity);

export default router;
