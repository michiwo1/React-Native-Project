import { UserService } from '../../services/user.service';
import { prisma } from '../setup';
import { AppError } from '../../utils/appError';
import { Prisma, User, UserProfile } from '@prisma/client';

type MockUser = {
  id: string;
  email: string;
  password_hash: string;
  display_name: string | null;
  created_at: Date;
  updated_at: Date;
};

type MockUserProfile = {
  id: string;
  user_id: string;
  weight: number | null;
  height: number | null;
  age: number | null;
  goal_type_id: string | null;
  training_level: string | null;
  created_at: Date;
  updated_at: Date;
};

type MockMeasurement = {
  id: string;
  user_id: string;
  metric_type_id: string;
  value: number;
  measured_at: Date;
  source: string | null;
  created_at: Date;
  updated_at: Date;
  metric_type: {
    id: string;
    name: string;
    unit: string;
    created_at: Date;
    updated_at: Date;
  };
};

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedPassword123',
        displayName: 'Test User'
      };

      const mockCreatedUser: MockUser = {
        id: 'user-1',
        email: userData.email,
        password_hash: userData.password,
        display_name: userData.displayName,
        created_at: new Date(),
        updated_at: new Date()
      };

      prisma.user.create.mockResolvedValue(mockCreatedUser);

      const result = await userService.create(userData);
      expect(result).toEqual({
        id: mockCreatedUser.id,
        email: mockCreatedUser.email,
        display_name: mockCreatedUser.display_name,
        created_at: mockCreatedUser.created_at,
        password_hash: mockCreatedUser.password_hash,
        updated_at: mockCreatedUser.updated_at
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
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
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        displayName: 'Test User'
      };

      prisma.user.create.mockRejectedValue({ code: 'P2002' });

      await expect(userService.create(userData))
        .rejects
        .toThrow(new AppError('Email already exists', 409));
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const email = 'test@example.com';
      const mockUser: MockUser = {
        id: 'user-1',
        email,
        password_hash: 'hashedPassword123',
        display_name: 'Test User',
        created_at: new Date(),
        updated_at: new Date()
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.findByEmail(email);
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email }
      });
    });

    it('should return null when user not found', async () => {
      const email = 'nonexistent@example.com';
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await userService.findByEmail(email);
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const userId = 'user-1';
      const mockUser: MockUser = {
        id: userId,
        email: 'test@example.com',
        display_name: 'Test User',
        password_hash: 'hashedPassword123',
        created_at: new Date(),
        updated_at: new Date()
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.findById(userId);
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        display_name: mockUser.display_name,
        created_at: mockUser.created_at,
        password_hash: mockUser.password_hash,
        updated_at: mockUser.updated_at
      });
    });
  });

  describe('update', () => {
    it('should update user data', async () => {
      const userId = 'user-1';
      const updateData = {
        displayName: 'Updated Name',
        email: 'updated@example.com'
      };

      const mockUpdatedUser: MockUser = {
        id: userId,
        email: updateData.email,
        display_name: updateData.displayName,
        password_hash: 'hashedPassword123',
        created_at: new Date(),
        updated_at: new Date()
      };

      prisma.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await userService.update(userId, updateData);
      expect(result).toEqual({
        id: mockUpdatedUser.id,
        email: mockUpdatedUser.email,
        display_name: mockUpdatedUser.display_name,
        created_at: mockUpdatedUser.created_at,
        password_hash: mockUpdatedUser.password_hash,
        updated_at: mockUpdatedUser.updated_at
      });
    });

    it('should throw error if email already exists', async () => {
      const userId = 'user-1';
      const updateData = {
        email: 'existing@example.com'
      };

      prisma.user.update.mockRejectedValue({ code: 'P2002' });

      await expect(userService.update(userId, updateData))
        .rejects
        .toThrow(new AppError('Email already exists', 409));
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const userId = 'user-1';
      const profileData = {
        height: 175,
        weight: 70,
        age: 30,
        goal_type: '筋力アップ'
      };

      const mockGoalType = {
        id: 'goal-1',
        name: '筋力アップ',
        created_at: new Date(),
        updated_at: new Date()
      };

      const mockProfile: MockUserProfile = {
        id: 'profile-1',
        user_id: userId,
        height: profileData.height,
        weight: profileData.weight,
        age: profileData.age,
        goal_type_id: mockGoalType.id,
        training_level: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      prisma.goalType.findFirst.mockResolvedValue(mockGoalType);
      prisma.userProfile.upsert.mockResolvedValue(mockProfile);

      const result = await userService.updateProfile(userId, profileData);
      expect(result).toEqual(mockProfile);
    });
  });

  describe('getLatestWeight', () => {
    it('should return latest weight with change from previous measurement', async () => {
      const userId = 'user-1';
      const mockMeasurements: MockMeasurement[] = [
        {
          id: 'measurement-2',
          user_id: userId,
          value: 70,
          measured_at: new Date('2024-01-29'),
          source: null,
          created_at: new Date(),
          updated_at: new Date(),
          metric_type_id: 'metric-1',
          metric_type: {
            id: 'metric-1',
            name: 'weight',
            unit: 'kg',
            created_at: new Date(),
            updated_at: new Date()
          }
        },
        {
          id: 'measurement-1',
          user_id: userId,
          value: 71,
          measured_at: new Date('2024-01-22'),
          source: null,
          created_at: new Date(),
          updated_at: new Date(),
          metric_type_id: 'metric-1',
          metric_type: {
            id: 'metric-1',
            name: 'weight',
            unit: 'kg',
            created_at: new Date(),
            updated_at: new Date()
          }
        }
      ];

      prisma.measurement.findMany.mockResolvedValue(mockMeasurements);

      const result = await userService.getLatestWeight(userId);
      expect(result).toEqual({
        weight: 70,
        date: mockMeasurements[0].measured_at,
        change: -1
      });
    });

    it('should return weight from profile if no measurements exist', async () => {
      const userId = 'user-1';
      const mockProfile: MockUserProfile = {
        id: 'profile-1',
        user_id: userId,
        weight: 70,
        height: 175,
        age: 30,
        goal_type_id: null,
        training_level: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      prisma.measurement.findMany.mockResolvedValue([]);
      prisma.userProfile.findUnique.mockResolvedValue(mockProfile);

      const result = await userService.getLatestWeight(userId);
      expect(result).toEqual({
        weight: mockProfile.weight,
        date: mockProfile.updated_at,
        change: null
      });
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile with all required information', async () => {
      const userId = 'user-1';
      const mockUser: MockUser = {
        id: userId,
        email: 'test@example.com',
        password_hash: 'hashedPassword123',
        display_name: 'Test User',
        created_at: new Date(),
        updated_at: new Date()
      };

      const mockProfile: MockUserProfile & { goal_type: { name: string } } = {
        id: 'profile-1',
        user_id: userId,
        weight: 70,
        height: 175,
        age: 30,
        goal_type_id: 'goal-1',
        training_level: null,
        created_at: new Date(),
        updated_at: new Date(),
        goal_type: {
          name: '筋力アップ'
        }
      };

      const mockLatestWeight: MockMeasurement = {
        id: 'measurement-1',
        user_id: userId,
        value: 70,
        measured_at: new Date(),
        source: null,
        created_at: new Date(),
        updated_at: new Date(),
        metric_type_id: 'metric-1',
        metric_type: {
          id: 'metric-1',
          name: 'weight',
          unit: 'kg',
          created_at: new Date(),
          updated_at: new Date()
        }
      };

      prisma.userProfile.findUnique.mockResolvedValue(mockProfile);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.measurement.findFirst.mockResolvedValue(mockLatestWeight);

      const result = await userService.getUserProfile(userId);
      expect(result).toMatchObject({
        id: userId,
        display_name: mockUser.display_name,
        weight: mockProfile.weight,
        height: mockProfile.height,
        age: mockProfile.age,
        goal_type: mockProfile.goal_type.name,
        latest_weight: {
          value: mockLatestWeight.value,
          measured_at: mockLatestWeight.measured_at.toISOString()
        }
      });
      expect(result).toHaveProperty('calorie_target');
      expect(result).toHaveProperty('protein_target');
      expect(result).toHaveProperty('carb_target');
      expect(result).toHaveProperty('fat_target');
    });
  });
}); 
