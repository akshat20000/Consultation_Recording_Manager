import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { User, IUser } from '../models/User';
import { ApiError } from '../utils/ApiError';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = '';

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'Not authorized, token required');
    }

    // Verify token
    const decoded = AuthService.verifyToken(token);

    // Fetch user
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      throw new ApiError(401, 'User not found or deleted');
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};
