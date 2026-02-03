import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth';
import {
    listCourseOfferings,
    createCourseOffering,
    getCourseOffering,
    updateCourseOffering,
    patchCourseOffering,
    deleteCourseOffering
} from '../controllers/courseOfferingController';

const router = Router();

router.get('/', listCourseOfferings);
router.post('/', authenticateJWT, createCourseOffering);
router.get('/:courseOfferingId', getCourseOffering);
router.put('/:courseOfferingId', authenticateJWT, updateCourseOffering);
router.patch('/:courseOfferingId', authenticateJWT, patchCourseOffering);
router.delete('/:courseOfferingId', authenticateJWT, deleteCourseOffering);

export default router;
