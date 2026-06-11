import { Router } from 'express';
import { ClientController } from '../controllers/client.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { protect } from '../middleware/auth.middleware.js';
import { createClientSchema, updateClientSchema } from '../validators/client.validator.js';

const router = Router();

router.use(protect as any); // Protect all client routes

router.post('/', validate(createClientSchema), ClientController.create as any);
router.get('/', ClientController.list as any);
router.get('/:id', ClientController.getById as any);
router.put('/:id', validate(updateClientSchema), ClientController.update as any);
router.delete('/:id', ClientController.delete as any);

export default router;
