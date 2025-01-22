import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/appError';

interface CreateUserData {
  email: string;
  password: string;
  displayName?: string;
}

interface UpdateUserData {
  displayName?: string;
  email?: string;
  password_hash?: string;
}

export class UserService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  public async create(userData: CreateUserData) {
    try {
      return await this.prisma.user.create({
        data: {
          email: userData.email,
          password_hash: userData.password,
          display_name: userData.displayName
        },
        select: {
          id: true,
          email: true,
          display_name: true,
          created_at: true
        }
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new AppError('Email already exists', 409);
      }
      throw error;
    }
  }

  public async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  public async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        display_name: true,
        created_at: true,
        password_hash: true
      }
    });
  }

  public async update(id: string, data: UpdateUserData) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          display_name: data.displayName,
          email: data.email,
          password_hash: data.password_hash
        },
        select: {
          id: true,
          email: true,
          display_name: true,
          created_at: true
        }
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new AppError('Email already exists', 409);
      }
      throw error;
    }
  }
} 
} 