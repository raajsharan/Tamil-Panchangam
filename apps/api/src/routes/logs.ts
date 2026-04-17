import { Router } from 'express';
import { logController } from '../controllers';
import { authenticate, authorize } from '../middleware';

const router = Router();

router.use(authenticate);
router.use(authorize('super-admin', 'editor'));

router.get('/', logController.getLogs.bind(logController));
router.get('/type/:type', logController.getLogsByType.bind(logController));
router.get('/errors', logController.getRecentErrors.bind(logController));
router.delete('/clear', logController.clearOldLogs.bind(logController));

export default router;
