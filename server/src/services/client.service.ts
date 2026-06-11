import { Client, IClient } from '../models/Client';
import { ApiError } from '../utils/ApiError';
import { Types } from 'mongoose';

export class ClientService {
  /**
   * Create a new client profile
   */
  static async createClient(
    userId: string,
    clientData: { name: string; email: string; phone: string; notes?: string }
  ): Promise<IClient> {
    const client = await Client.create({
      userId: new Types.ObjectId(userId),
      ...clientData,
    });
    return client;
  }

  /**
   * Retrieve all clients belonging to user, supporting search
   */
  static async getClients(
    userId: string,
    search?: string
  ): Promise<IClient[]> {
    const filter: any = { userId: new Types.ObjectId(userId) };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    return await Client.find(filter).sort({ name: 1 });
  }

  /**
   * Find client by ID and verify ownership
   */
  static async getClientById(userId: string, clientId: string): Promise<IClient> {
    const client = await Client.findOne({
      _id: new Types.ObjectId(clientId),
      userId: new Types.ObjectId(userId),
    });

    if (!client) {
      throw new ApiError(404, 'Client not found or access denied');
    }

    return client;
  }

  /**
   * Update client profile
   */
  static async updateClient(
    userId: string,
    clientId: string,
    updateData: { name?: string; email?: string; phone?: string; notes?: string }
  ): Promise<IClient> {
    const client = await Client.findOneAndUpdate(
      { _id: new Types.ObjectId(clientId), userId: new Types.ObjectId(userId) },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!client) {
      throw new ApiError(404, 'Client not found or access denied');
    }

    return client;
  }

  /**
   * Delete client profile
   */
  static async deleteClient(userId: string, clientId: string): Promise<void> {
    const result = await Client.deleteOne({
      _id: new Types.ObjectId(clientId),
      userId: new Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      throw new ApiError(404, 'Client not found or access denied');
    }
  }
}
