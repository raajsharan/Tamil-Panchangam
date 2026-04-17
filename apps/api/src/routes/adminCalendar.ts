import { Router } from 'express';
import { adminCalendarController } from '../controllers';
import { authenticate, authorize } from '../middleware';

const router = Router();

router.use(authenticate);

router.get('/', adminCalendarController.getAll.bind(adminCalendarController));
router.get('/stats', adminCalendarController.getStats.bind(adminCalendarController));
router.get('/unverified', adminCalendarController.getUnverified.bind(adminCalendarController));
router.get('/errors', adminCalendarController.getWithErrors.bind(adminCalendarController));
router.post('/', adminCalendarController.create.bind(adminCalendarController));
router.put('/:date', adminCalendarController.update.bind(adminCalendarController));
router.delete('/:date', adminCalendarController.delete.bind(adminCalendarController));

export default router;
