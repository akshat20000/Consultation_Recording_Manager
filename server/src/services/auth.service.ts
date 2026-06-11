import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

export interface IAuthResult {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  };
  token: string;
}

export class AuthService {
  /**
   * Register a new astrologer user
   */
  static async register(name: string, email: string, password: string): Promise<IAuthResult> {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(400, 'User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
    });

    const token = this.generateToken(user._id.toString());

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Login an astrologer
   */
  static async login(email: string, password: string): Promise<IAuthResult> {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const token = this.generateToken(user._id.toString());

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Helper to generate JWT token
   */
  private static generateToken(userId: string): string {
    return jwt.sign({ id: userId }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }

  /**
   * Decode and verify JWT token
   */
  static verifyToken(token: string): { id: string } {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
      return decoded;
    } catch (error) {
      throw new ApiError(401, 'Invalid or expired authentication token');
    }
  }
}
