import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { protect } from '../middleware/auth.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validator';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.get('/me', protect as any, AuthController.getCurrentUser as any);
router.post('/logout', protect as any, AuthController.logout);

export default router;
