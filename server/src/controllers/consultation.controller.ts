import { Response, NextFunction } from 'express';
import { ConsultationService } from '../services/consultation.service';
import { ExportService } from '../services/export.service';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class ConsultationController {
  /**
   * Create consultation (with audio upload)
   */
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id.toString();

      if (!req.file) {
        throw new ApiError(400, 'Audio recording file is required');
      }

      const localFilePath = req.file.path;
      const consultation = await ConsultationService.createConsultation(
        userId,
        req.body,
        localFilePath
      );

      return res
        .status(201)
        .json(new ApiResponse(201, consultation, 'Consultation recorded and saved successfully'));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * List user's consultations (supports search and advanced filters)
   */
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id.toString();
      const {
        search,
        clientId,
        tags,
        startDate,
        endDate,
        minDuration,
        maxDuration,
        showDeleted,
      } = req.query;

      // Parse tags if comma-separated
      let parsedTags: string[] | undefined;
      if (typeof tags === 'string') {
        parsedTags = tags.split(',').map((t) => t.trim());
      }

      const consultations = await ConsultationService.getConsultations(userId, {
        search: search as string,
        clientId: clientId as string,
        tags: parsedTags,
        startDate: startDate as string,
        endDate: endDate as string,
        minDuration: minDuration ? Number(minDuration) : undefined,
        maxDuration: maxDuration ? Number(maxDuration) : undefined,
        showDeleted: showDeleted === 'true',
      });

      return res
        .status(200)
        .json(new ApiResponse(200, consultations, 'Consultations retrieved successfully'));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Retrieve single consultation details
   */
  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id.toString();
      const consultationId = req.params.id;
      const consultation = await ConsultationService.getConsultationById(userId, consultationId);

      return res
        .status(200)
        .json(new ApiResponse(200, consultation, 'Consultation details retrieved successfully'));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Update consultation notes/tags/title
   */
  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id.toString();
      const consultationId = req.params.id;
      const consultation = await ConsultationService.updateConsultation(
        userId,
        consultationId,
        req.body
      );

      return res
        .status(200)
        .json(new ApiResponse(200, consultation, 'Consultation updated successfully'));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Soft delete a consultation record
   */
  static async softDelete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id.toString();
      const consultationId = req.params.id;
      await ConsultationService.softDeleteConsultation(userId, consultationId);

      return res
        .status(200)
        .json(new ApiResponse(200, null, 'Consultation moved to bin (soft-deleted)'));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Restore a soft-deleted consultation
   */
  static async restore(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id.toString();
      const consultationId = req.params.id;
      const consultation = await ConsultationService.restoreConsultation(userId, consultationId);

      return res
        .status(200)
        .json(new ApiResponse(200, consultation, 'Consultation restored successfully'));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Hard delete a consultation (permanently delete from database and storage)
   */
  static async hardDelete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id.toString();
      const consultationId = req.params.id;
      await ConsultationService.hardDeleteConsultation(userId, consultationId);

      return res
        .status(200)
        .json(new ApiResponse(200, null, 'Consultation permanently deleted'));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Export summary report as plain text or markdown download
   */
  static async exportFile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id.toString();
      const consultationId = req.params.id;
      const format = (req.query.format as string || 'md').toLowerCase();

      const consultation = await ConsultationService.getConsultationById(userId, consultationId);
      let content = '';
      let filename = `consultation-${consultationId}`;

      if (format === 'txt') {
        content = ExportService.generateTextExport(consultation);
        filename += '.txt';
        res.setHeader('Content-Type', 'text/plain');
      } else {
        content = ExportService.generateMarkdownExport(consultation);
        filename += '.md';
        res.setHeader('Content-Type', 'text/markdown');
      }

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(content);
    } catch (error) {
      return next(error);
    }
  }
}
