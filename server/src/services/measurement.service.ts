import { PrismaClient, Measurement } from '@prisma/client';

const prisma = new PrismaClient();

interface WeightHistory {
  value: number;
  date: Date;
}

export class MeasurementService {
  private readonly WEIGHT_METRIC_ID = 'clrqw0g0h000108l45wj7d1jx'; // ID from migration
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
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

  async getWeightHistoryWithProfile(userId: string): Promise<WeightHistory[]> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [measurements, profile] = await Promise.all([
      this.prisma.measurement.findMany({
        where: {
          user_id: userId,
          metric_type_id: this.WEIGHT_METRIC_ID,
          measured_at: {
            gte: sixMonthsAgo
          }
        },
        orderBy: {
          measured_at: 'asc'
        }
      }),
      this.prisma.userProfile.findUnique({
        where: { user_id: userId }
      })
    ]);

    // プロフィールの体重をデフォルト値として使用
    if (measurements.length === 0 && profile?.weight) {
      return [{
        value: profile.weight,
        date: new Date()
      }];
    }

    return measurements.map(m => ({
      value: m.value,
      date: m.measured_at
    }));
  }
} 