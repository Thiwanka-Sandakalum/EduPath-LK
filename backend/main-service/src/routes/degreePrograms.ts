import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth';
import {
    listDegreePrograms,
    createDegreeProgram,
    getDegreeProgram,
    updateDegreeProgram,
    patchDegreeProgram,
    deleteDegreeProgram
} from '../controllers/degreeProgramController';

const router = Router();

router.get('/', listDegreePrograms);
router.post('/', authenticateJWT, createDegreeProgram);
router.get('/:degreeProgramId', getDegreeProgram);
router.put('/:degreeProgramId', authenticateJWT, updateDegreeProgram);
router.patch('/:degreeProgramId', authenticateJWT, patchDegreeProgram);
router.delete('/:degreeProgramId', authenticateJWT, deleteDegreeProgram);

export default router;
