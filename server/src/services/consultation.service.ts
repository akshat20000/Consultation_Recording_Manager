import { Consultation, IConsultation } from '../models/Consultation';
import { Client } from '../models/Client';
import { RecordingService } from './recording.service';
import { TranscriptService } from './transcript.service';
import { SummaryService } from './summary.service';
import { ApiError } from '../utils/ApiError';
import { Types } from 'mongoose';

export interface IConsultationFilters {
  search?: string;
  clientId?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  minDuration?: number;
  maxDuration?: number;
  showDeleted?: boolean;
}

export class ConsultationService {
  /**
   * Create a new consultation record
   */
  static async createConsultation(
    userId: string,
    data: {
      clientId: string;
      title: string;
      notes?: string;
      tags?: string[];
      consentGiven: boolean;
      consentTimestamp: string;
      duration: number;
    },
    localFilePath: string
  ): Promise<IConsultation> {
    // Verify client exists
    const client = await Client.findOne({
      _id: new Types.ObjectId(data.clientId),
      userId: new Types.ObjectId(userId),
    });
    if (!client) {
      throw new ApiError(404, 'Client not found or access denied');
    }

    if (!data.consentGiven) {
      throw new ApiError(400, 'Client consent is mandatory to create a recording');
    }

    // 1. Generate transcript (must happen before upload, which may delete the local file)
    const transcript = await TranscriptService.generateTranscript(
      localFilePath,
      client.name,
      data.title,
      data.tags && data.tags.length > 0 ? data.tags[0] : undefined
    );

    // 2. Generate summary
    const summary = await SummaryService.generateSummary(transcript);

    // 3. Upload audio
    const uploadResult = await RecordingService.uploadRecording(localFilePath);

    // 4. Save consultation
    const consultation = await Consultation.create({
      userId: new Types.ObjectId(userId),
      clientId: new Types.ObjectId(data.clientId),
      title: data.title,
      recordingUrl: uploadResult.url,
      recordingPublicId: uploadResult.publicId,
      transcript,
      summary,
      notes: data.notes || '',
      tags: data.tags || [],
      consentGiven: data.consentGiven,
      consentTimestamp: new Date(data.consentTimestamp),
      duration: data.duration,
      isDeleted: false,
    });

    return consultation;
  }

  /**
   * Search and filter consultations list
   */
  static async getConsultations(
    userId: string,
    filters: IConsultationFilters = {}
  ): Promise<any[]> {
    const query: any = {
      userId: new Types.ObjectId(userId),
      isDeleted: filters.showDeleted === true ? true : false,
    };

    // Filter by client
    if (filters.clientId) {
      query.clientId = new Types.ObjectId(filters.clientId);
    }

    // Filter by tag matching (match all specified tags)
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $all: filters.tags };
    }

    // Filter by date range
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        // Extend to end of the day
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Filter by duration range (seconds)
    if (filters.minDuration !== undefined || filters.maxDuration !== undefined) {
      query.duration = {};
      if (filters.minDuration !== undefined) {
        query.duration.$gte = filters.minDuration;
      }
      if (filters.maxDuration !== undefined) {
        query.duration.$lte = filters.maxDuration;
      }
    }

    // Advanced Text Search
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      
      // Since we want to search client name too, we'll fetch matching clients first
      const matchingClients = await Client.find({
        userId: new Types.ObjectId(userId),
        name: searchRegex,
      }).select('_id');
      const clientIds = matchingClients.map((c) => c._id);

      query.$or = [
        { title: searchRegex },
        { tags: searchRegex },
        { notes: searchRegex },
        { transcript: searchRegex },
        { 'summary.keyTopics': searchRegex },
        { clientId: { $in: clientIds } },
      ];
    }

    // Populate client details
    return await Consultation.find(query)
      .populate('clientId', 'name email phone')
      .sort({ createdAt: -1 });
  }

  /**
   * Get single consultation details
   */
  static async getConsultationById(
    userId: string,
    consultationId: string
  ): Promise<IConsultation> {
    const consultation = await Consultation.findOne({
      _id: new Types.ObjectId(consultationId),
      userId: new Types.ObjectId(userId),
    }).populate('clientId', 'name email phone');

    if (!consultation) {
      throw new ApiError(404, 'Consultation not found or access denied');
    }

    return consultation;
  }

  /**
   * Update consultation notes, tags, title
   */
  static async updateConsultation(
    userId: string,
    consultationId: string,
    updateData: {
      title?: string;
      notes?: string;
      tags?: string[];
      transcript?: string;
    }
  ): Promise<IConsultation> {
    // If transcript is updated, we re-run summarization too
    const updates: any = { ...updateData };
    if (updateData.transcript) {
      updates.summary = await SummaryService.generateSummary(updateData.transcript);
    }

    const consultation = await Consultation.findOneAndUpdate(
      {
        _id: new Types.ObjectId(consultationId),
        userId: new Types.ObjectId(userId),
      },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('clientId', 'name email phone');

    if (!consultation) {
      throw new ApiError(404, 'Consultation not found or access denied');
    }

    return consultation;
  }

  /**
   * Soft delete a consultation
   */
  static async softDeleteConsultation(
    userId: string,
    consultationId: string
  ): Promise<void> {
    const result = await Consultation.updateOne(
      {
        _id: new Types.ObjectId(consultationId),
        userId: new Types.ObjectId(userId),
        isDeleted: false,
      },
      { $set: { isDeleted: true } }
    );

    if (result.matchedCount === 0) {
      throw new ApiError(404, 'Consultation not found or already deleted');
    }
  }

  /**
   * Restore a soft-deleted consultation
   */
  static async restoreConsultation(
    userId: string,
    consultationId: string
  ): Promise<IConsultation> {
    const consultation = await Consultation.findOneAndUpdate(
      {
        _id: new Types.ObjectId(consultationId),
        userId: new Types.ObjectId(userId),
        isDeleted: true,
      },
      { $set: { isDeleted: false } },
      { new: true }
    ).populate('clientId', 'name email phone');

    if (!consultation) {
      throw new ApiError(404, 'Consultation not found or is not deleted');
    }

    return consultation;
  }

  /**
   * Permanently delete a consultation and its media asset
   */
  static async hardDeleteConsultation(
    userId: string,
    consultationId: string
  ): Promise<void> {
    const consultation = await Consultation.findOne({
      _id: new Types.ObjectId(consultationId),
      userId: new Types.ObjectId(userId),
    });

    if (!consultation) {
      throw new ApiError(404, 'Consultation not found or access denied');
    }

    // Delete media
    await RecordingService.deleteRecording(
      consultation.recordingUrl,
      consultation.recordingPublicId
    );

    // Remove from DB
    await Consultation.deleteOne({ _id: consultation._id });
  }
}
