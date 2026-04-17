import { Router } from 'express';
import { scraperController } from '../controllers';
import { authenticate, authorize } from '../middleware';

const router = Router();

router.use(authenticate);
router.use(authorize('super-admin', 'editor'));

router.get('/status', scraperController.getStatus.bind(scraperController));
router.get('/status/:source', scraperController.getSourceStatus.bind(scraperController));
router.post('/run', scraperController.runScrape.bind(scraperController));

export default router;
