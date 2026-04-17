import { Router } from 'express';
import { calendarController } from '../controllers';

const router = Router();

router.get('/today', calendarController.getToday.bind(calendarController));
router.get('/date/:date', calendarController.getByDate.bind(calendarController));
router.get('/month/:year/:month', calendarController.getByMonth.bind(calendarController));
router.get('/range', calendarController.getByDateRange.bind(calendarController));
router.get('/search', calendarController.search.bind(calendarController));

export default router;
