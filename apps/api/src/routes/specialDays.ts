import { Router } from 'express';
import { specialDayController } from '../controllers';

const router = Router();

router.get('/', specialDayController.getAll.bind(specialDayController));
router.get('/upcoming', specialDayController.getUpcoming.bind(specialDayController));
router.get('/date/:date', specialDayController.getByDate.bind(specialDayController));
router.post('/', specialDayController.create.bind(specialDayController));
router.put('/:id', specialDayController.update.bind(specialDayController));
router.delete('/:id', specialDayController.delete.bind(specialDayController));

export default router;
