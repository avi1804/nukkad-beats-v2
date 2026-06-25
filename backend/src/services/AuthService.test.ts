import { AuthService } from './AuthService';
import { prisma } from '../utils/prisma';
import { AuthUtils } from '../utils/auth';
import { TokenService } from './TokenService';
import { EmailService } from './EmailService';
import { Role } from '@prisma/client';

// Mock dependencies
jest.mock('../utils/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('../utils/auth');
jest.mock('./TokenService');
jest.mock('./EmailService', () => ({
  EmailService: {
    sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('AuthService', () => {
  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    fullName: 'Test User',
    email: 'test@example.com',
    phone: '1234567890',
    passwordHash: '$2b$10$hashedpassword',
    role: Role.USER,
    profileImage: null,
    isVerified: false,
    isBlocked: false,
    deletedAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockTokens = {
    accessToken: 'mock.access.token',
    refreshToken: 'mock.refresh.token',
  };

  const mockTokenPayload = {
    userId: mockUser.id,
    email: mockUser.email,
    role: Role.USER,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    (TokenService.generateAccessToken as jest.Mock).mockReturnValue(mockTokens.accessToken);
    (TokenService.generateRefreshToken as jest.Mock).mockReturnValue(mockTokens.refreshToken);
  });

  describe('register', () => {
    const registerData = {
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      password: 'password123',
    };

    it('should successfully register a new user with USER role', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (AuthUtils.hashPassword as jest.Mock).mockResolvedValue('$2b$10$hashedpassword');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await AuthService.register(registerData);

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerData.email },
      });
      expect(AuthUtils.hashPassword).toHaveBeenCalledWith(registerData.password);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          fullName: registerData.fullName,
          email: registerData.email,
          phone: registerData.phone,
          passwordHash: '$2b$10$hashedpassword',
          role: Role.USER,
        },
      });
      expect(TokenService.generateAccessToken).toHaveBeenCalledWith(mockUser);
      expect(TokenService.generateRefreshToken).toHaveBeenCalledWith(mockUser);
      expect(EmailService.sendWelcomeEmail).toHaveBeenCalledWith(mockUser);
      
      expect(result).toEqual({
        user: expect.not.objectContaining({ passwordHash: expect.anything() }),
        tokens: mockTokens,
      });
      expect(result.user).toHaveProperty('id', mockUser.id);
      expect(result.user).toHaveProperty('email', mockUser.email);
      expect(result.user).toHaveProperty('role', Role.USER);
    });

    it('should throw error if email already exists', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Act & Assert
      await expect(AuthService.register(registerData)).rejects.toThrow('Email is already registered');
      expect(AuthUtils.hashPassword).not.toHaveBeenCalled();
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('should not include passwordHash in returned user object', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (AuthUtils.hashPassword as jest.Mock).mockResolvedValue('$2b$10$hashedpassword');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await AuthService.register(registerData);

      // Assert
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should handle password hashing errors', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (AuthUtils.hashPassword as jest.Mock).mockRejectedValue(new Error('Hashing failed'));

      // Act & Assert
      await expect(AuthService.register(registerData)).rejects.toThrow('Hashing failed');
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (AuthUtils.comparePassword as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await AuthService.login(loginData);

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginData.email },
      });
      expect(AuthUtils.comparePassword).toHaveBeenCalledWith(loginData.password, mockUser.passwordHash);
      expect(TokenService.generateAccessToken).toHaveBeenCalledWith(mockUser);
      expect(TokenService.generateRefreshToken).toHaveBeenCalledWith(mockUser);
      
      expect(result).toEqual({
        user: expect.not.objectContaining({ passwordHash: expect.anything() }),
        tokens: mockTokens,
      });
    });

    it('should throw error if user not found', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(AuthService.login(loginData)).rejects.toThrow('Invalid email or password');
      expect(AuthUtils.comparePassword).not.toHaveBeenCalled();
    });

    it('should throw error if password is invalid', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (AuthUtils.comparePassword as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(AuthService.login(loginData)).rejects.toThrow('Invalid email or password');
      expect(TokenService.generateAccessToken).not.toHaveBeenCalled();
    });

    it('should throw error if account is blocked', async () => {
      // Arrange
      const blockedUser = { ...mockUser, isBlocked: true };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(blockedUser);

      // Act & Assert
      await expect(AuthService.login(loginData)).rejects.toThrow('Account is blocked');
      expect(AuthUtils.comparePassword).not.toHaveBeenCalled();
    });

    it('should throw error if account is deleted', async () => {
      // Arrange
      const deletedUser = { ...mockUser, deletedAt: new Date() };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(deletedUser);

      // Act & Assert
      await expect(AuthService.login(loginData)).rejects.toThrow('Account is deleted');
      expect(AuthUtils.comparePassword).not.toHaveBeenCalled();
    });

    it('should not include passwordHash in returned user object', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (AuthUtils.comparePassword as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await AuthService.login(loginData);

      // Assert
      expect(result.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('refreshToken', () => {
    it('should successfully generate new tokens from valid refresh token', async () => {
      // Arrange
      (TokenService.verifyToken as jest.Mock).mockReturnValue(mockTokenPayload);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await AuthService.refreshToken(mockTokens.refreshToken);

      // Assert
      expect(TokenService.verifyToken).toHaveBeenCalledWith(mockTokens.refreshToken);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockTokenPayload.userId },
      });
      expect(TokenService.generateAccessToken).toHaveBeenCalledWith(mockUser);
      expect(TokenService.generateRefreshToken).toHaveBeenCalledWith(mockUser);
      
      expect(result).toEqual(mockTokens);
    });

    it('should throw error if refresh token is invalid', async () => {
      // Arrange
      (TokenService.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid or expired token');
      });

      // Act & Assert
      await expect(AuthService.refreshToken('invalid.token')).rejects.toThrow('Invalid refresh token');
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      // Arrange
      (TokenService.verifyToken as jest.Mock).mockReturnValue(mockTokenPayload);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(AuthService.refreshToken(mockTokens.refreshToken)).rejects.toThrow('Invalid refresh token');
    });

    it('should throw error if user is blocked', async () => {
      // Arrange
      const blockedUser = { ...mockUser, isBlocked: true };
      (TokenService.verifyToken as jest.Mock).mockReturnValue(mockTokenPayload);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(blockedUser);

      // Act & Assert
      await expect(AuthService.refreshToken(mockTokens.refreshToken)).rejects.toThrow('Invalid refresh token');
    });

    it('should throw error if user is deleted', async () => {
      // Arrange
      const deletedUser = { ...mockUser, deletedAt: new Date() };
      (TokenService.verifyToken as jest.Mock).mockReturnValue(mockTokenPayload);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(deletedUser);

      // Act & Assert
      await expect(AuthService.refreshToken(mockTokens.refreshToken)).rejects.toThrow('Invalid refresh token');
    });

    it('should throw error if token verification fails', async () => {
      // Arrange
      (TokenService.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Token expired');
      });

      // Act & Assert
      await expect(AuthService.refreshToken('expired.token')).rejects.toThrow('Invalid refresh token');
    });
  });
});
