import { PrismaClient } from '@prisma/client';

export async function seedMetricTypes(prisma: PrismaClient) {
  const metricTypes = [
    { id: 'clrqw0g0h000108l45wj7d1jx', name: 'weight', unit: 'kg' },
    { id: 'clrqw0g0h000208l45k8f2m9y', name: 'height', unit: 'cm' },
    { id: 'clrqw0g0h000308l4592h3n0z', name: 'body_fat', unit: '%' },
    { id: 'clrqw0g0h000408l45p4j4o1a', name: 'muscle_mass', unit: 'kg' },
    { id: 'clrqw0g0h000508l45r6k5p2b', name: 'bmi', unit: '' },
    { id: 'clrqw0g0h000608l45t8l6q3c', name: 'calories', unit: 'kcal' },
    { id: 'clrqw0g0h000708l45v0m7r4d', name: 'protein', unit: 'g' },
    { id: 'clrqw0g0h000808l45x2n8s5e', name: 'carbs', unit: 'g' },
    { id: 'clrqw0g0h000908l45z4o9t6f', name: 'fat', unit: 'g' }
  ];

  for (const metricType of metricTypes) {
    await prisma.metricType.upsert({
      where: { id: metricType.id },
      update: {},
      create: {
        id: metricType.id,
        name: metricType.name,
        unit: metricType.unit,
      },
    });
  }

  console.log('Metric types seeded successfully');
} 