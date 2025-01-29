import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

export const prisma = mockDeep<PrismaClient>();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => prisma)
}));

beforeEach(() => {
  jest.clearAllMocks();
});

export type Context = {
  prisma: PrismaClient;
}; 