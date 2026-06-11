import { Response, NextFunction } from 'express';
import { ClientService } from '../services/client.service';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class ClientController {
  /**
   * Create client profile
   */
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id.toString();
      const client = await ClientService.createClient(userId, req.body);
      
      return res
        .status(201)
        .json(new ApiResponse(201, client, 'Client profile created successfully'));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * List user's clients
   */
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id.toString();
      const search = req.query.search as string | undefined;
      const clients = await ClientService.getClients(userId, search);

      return res
        .status(200)
        .json(new ApiResponse(200, clients, 'Clients retrieved successfully'));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Retrieve single client details
   */
  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id.toString();
      const clientId = req.params.id;
      const client = await ClientService.getClientById(userId, clientId);

      return res
        .status(200)
        .json(new ApiResponse(200, client, 'Client details retrieved successfully'));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Update client profile
   */
  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id.toString();
      const clientId = req.params.id;
      const client = await ClientService.updateClient(userId, clientId, req.body);

      return res
        .status(200)
        .json(new ApiResponse(200, client, 'Client profile updated successfully'));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Delete client profile
   */
  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id.toString();
      const clientId = req.params.id;
      await ClientService.deleteClient(userId, clientId);

      return res
        .status(200)
        .json(new ApiResponse(200, null, 'Client profile deleted successfully'));
    } catch (error) {
      return next(error);
    }
  }
}
