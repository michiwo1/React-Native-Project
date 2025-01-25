import { Request, Response } from 'express';
import { MeasurementService } from '../services/measurement.service';


export class MeasurementController {
  private measurementService: MeasurementService;

  constructor() {
    this.measurementService = new MeasurementService();
  }

  public recordWeight = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { weight } = req.body;
      if (!weight || typeof weight !== 'number') {
        return res.status(400).json({ message: 'Valid weight value is required' });
      }

      const measurement = await this.measurementService.recordWeight(userId, weight);
      return res.status(201).json(measurement);
    } catch (error) {
      console.error('Error recording weight:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  public getWeightHistory = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const history = await this.measurementService.getWeightHistory(userId);
      return res.status(200).json(history);
    } catch (error) {
      console.error('Error fetching weight history:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  async getWeightHistoryWithProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const weightHistory = await this.measurementService.getWeightHistoryWithProfile(userId);
      return res.status(200).json(weightHistory);
    } catch (error) {
      console.error('Error fetching weight history:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
} 