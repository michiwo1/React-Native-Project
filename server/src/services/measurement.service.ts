import { PrismaClient, Measurement } from '@prisma/client';

export class MeasurementService {
  private prisma: PrismaClient;
  private readonly WEIGHT_METRIC_ID = 'clrqw0g0h000108l45wj7d1jx'; // ID from migration

  constructor() {
    this.prisma = new PrismaClient();
  }

  public async recordWeight(userId: string, weight: number): Promise<Measurement> {
    return await this.prisma.measurement.create({
      data: {
        user_id: userId,
        metric_type_id: this.WEIGHT_METRIC_ID,
        value: weight,
        measured_at: new Date(),
      },
      include: {
        metric_type: true,
      },
    });
  }

  public async getWeightHistory(userId: string): Promise<Measurement[]> {
    return await this.prisma.measurement.findMany({
      where: {
        user_id: userId,
        metric_type_id: this.WEIGHT_METRIC_ID,
      },
      orderBy: {
        measured_at: 'desc',
      },
      include: {
        metric_type: true,
      },
    });
  }
} 