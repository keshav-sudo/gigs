import { Schema, model, Types } from 'mongoose';

export interface IGenerationHistory {
  userId: Types.ObjectId;
  gigDraftId?: Types.ObjectId;
  generationType: 'full_generation' | 'section_regeneration';
  input: any;
  output: any;
  model: string;
  createdAt?: Date;
}

const GenerationHistorySchema = new Schema<IGenerationHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    gigDraftId: {
      type: Schema.Types.ObjectId,
      ref: 'GigDraft'
    },
    generationType: {
      type: String,
      enum: ['full_generation', 'section_regeneration'],
      required: true
    },
    input: {
      type: Schema.Types.Mixed,
      required: true
    },
    output: {
      type: Schema.Types.Mixed,
      required: true
    },
    model: {
      type: String,
      required: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

export const GenerationHistory = model<IGenerationHistory>('GenerationHistory', GenerationHistorySchema);
