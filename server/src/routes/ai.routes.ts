import express from 'express';
import multer from 'multer';
import { AIController } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const aiController = new AIController();

// メモリ上に画像を保存するための設定
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB制限
  },
});

// Protected routes
router.use(authenticate);

// AI nutrition advice endpoint
router.post('/nutrition-advice', aiController.getNutritionAdvice);

// AI workout advice endpoint
router.post('/workout-advice', aiController.getWorkoutAdvice);

// 食事の写真を解析
router.post('/meal-analyze-image', upload.single('image'), aiController.analyzeMealImage);

export default router; 