import { Router } from 'express';
import { authController } from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

router.post('/login', authController.login.bind(authController));
router.post('/register', authController.register.bind(authController));
router.get('/profile', authenticate, authController.getProfile.bind(authController));
router.post('/change-password', authenticate, authController.changePassword.bind(authController));

export default router;
