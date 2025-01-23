import { Router } from 'express';
import { MeasurementController } from '../controllers/measurement.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const measurementController = new MeasurementController();

// Protected routes
router.use(authenticate);

router.post('/weight', measurementController.recordWeight);
router.get('/weight/history', measurementController.getWeightHistory);

export default router; 