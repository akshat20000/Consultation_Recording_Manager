import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;
      const result = await AuthService.register(name, email, password);
      
      return res
        .status(201)
        .json(new ApiResponse(201, result, 'Astrologer account registered successfully'));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      return res
        .status(200)
        .json(new ApiResponse(200, result, 'Login successful'));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get current authenticated user details
   */
  static async getCurrentUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        throw new ApiError(401, 'User context not found');
      }

      const userData = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      };

      return res
        .status(200)
        .json(new ApiResponse(200, userData, 'User profile retrieved successfully'));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Logout user (handy endpoint for documentation, state clearing handled in client)
   */
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      return res
        .status(200)
        .json(new ApiResponse(200, null, 'Logged out successfully'));
    } catch (error) {
      return next(error);
    }
  }
}
