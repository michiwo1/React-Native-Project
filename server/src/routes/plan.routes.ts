import { Router } from 'express';
import { PlanController } from '../controllers/plan.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const planController = new PlanController();

router.use(authenticate);

router.post('/', planController.createPlan);
router.get('/', planController.getUserPlans);
router.post('/:planId/start', planController.startWorkoutFromPlan);

export default router; 