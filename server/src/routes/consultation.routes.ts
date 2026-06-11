import { Router } from 'express';
import { ConsultationController } from '../controllers/consultation.controller';
import { upload } from '../middleware/upload.middleware';
import { validate } from '../middleware/validate.middleware';
import { protect } from '../middleware/auth.middleware';
import { createConsultationSchema, updateConsultationSchema } from '../validators/consultation.validator';

const router = Router();

router.use(protect as any); // Protect all consultation routes

router.post('/', upload.single('audio'), validate(createConsultationSchema), ConsultationController.create as any);
router.get('/', ConsultationController.list as any);
router.get('/:id', ConsultationController.getById as any);
router.put('/:id', validate(updateConsultationSchema), ConsultationController.update as any);
router.delete('/:id', ConsultationController.softDelete as any);
router.post('/:id/restore', ConsultationController.restore as any);
router.delete('/:id/permanent', ConsultationController.hardDelete as any);
router.get('/:id/export', ConsultationController.exportFile as any);

export default router;
