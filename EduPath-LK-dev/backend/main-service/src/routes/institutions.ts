import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth';
import { listInstitutions, createInstitution, patchInstitution, deleteInstitution, getInstitution, listInstitutionPrograms, updateInstitution } from '../controllers/institutionController';

const router = Router();

router.get('/', listInstitutions);
router.post('/', authenticateJWT, createInstitution);
router.get('/:institutionId', getInstitution);
router.put('/:institutionId', authenticateJWT, updateInstitution);
router.patch('/:institutionId', authenticateJWT, patchInstitution);
router.delete('/:institutionId', authenticateJWT, deleteInstitution);
router.get('/:institutionId/programs', listInstitutionPrograms);

export default router;
