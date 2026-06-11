import { Schema, model, Document, Types } from 'mongoose';

export interface IConsultationSummary {
  keyTopics: string[];
  recommendations: string[];
  actionItems: string[];
  followUps: string[];
  keywords: string[];
  sentiment: string;
}

export interface IConsultation extends Document {
  userId: Types.ObjectId;
  clientId: Types.ObjectId;
  title: string;
  recordingUrl: string;
  recordingPublicId?: string;
  transcript?: string;
  summary?: IConsultationSummary;
  notes?: string;
  tags: string[];
  consentGiven: boolean;
  consentTimestamp: Date;
  duration: number; // In seconds
  isDeleted: boolean; // For soft delete
  createdAt: Date;
  updatedAt: Date;
}

const ConsultationSchema = new Schema<IConsultation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Consultation title is required'],
      trim: true,
    },
    recordingUrl: {
      type: String,
      required: [true, 'Recording URL is required'],
    },
    recordingPublicId: {
      type: String,
    },
    transcript: {
      type: String,
      default: '',
    },
    summary: {
      keyTopics: { type: [String], default: [] },
      recommendations: { type: [String], default: [] },
      actionItems: { type: [String], default: [] },
      followUps: { type: [String], default: [] },
      keywords: { type: [String], default: [] },
      sentiment: { type: String, default: 'Neutral' },
    },
    notes: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    consentGiven: {
      type: Boolean,
      required: [true, 'Client consent is required'],
    },
    consentTimestamp: {
      type: Date,
      required: [true, 'Consent timestamp is required'],
    },
    duration: {
      type: Number,
      required: [true, 'Recording duration is required'],
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true, // Auto manages createdAt and updatedAt
  }
);

export const Consultation = model<IConsultation>('Consultation', ConsultationSchema);
