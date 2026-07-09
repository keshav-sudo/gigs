import { Schema, model, Document, Types } from 'mongoose';
import { CompetitorResearchData, GeneratedGigContent } from '@gigcraft-ai/shared';

export interface IGigDraft extends Document {
  userId: Types.ObjectId;
  serviceType: string;
  rawDescription: string;
  technologies: string[];
  targetBuyer: string;
  experienceLevel: string;
  pricingPreference: string;
  researchData: CompetitorResearchData;
  generatedContent?: GeneratedGigContent;
  status: 'draft' | 'completed';
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const CompetitorResearchSchema = new Schema<CompetitorResearchData>({
  competitorTitles: { type: String, default: '' },
  competitorPricing: { type: String, default: '' },
  commonKeywords: { type: String, default: '' },
  popularTags: { type: String, default: '' },
  competitorDescriptions: { type: String, default: '' },
  marketObservations: { type: String, default: '' }
}, { _id: false });

const PackageSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  deliveryDays: { type: Number, required: true },
  revisions: { type: Number, required: true },
  features: [{ type: String }]
}, { _id: false });

const GeneratedContentSchema = new Schema<GeneratedGigContent>({
  gigTitle: { type: String, required: true },
  alternativeTitles: [{ type: String }],
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  searchTags: [{ type: String }],
  seoKeywords: [{ type: String }],
  packages: {
    basic: { type: PackageSchema, required: true },
    standard: { type: PackageSchema, required: true },
    premium: { type: PackageSchema, required: true }
  },
  description: { type: String, required: true },
  faqs: [{
    question: { type: String, required: true },
    answer: { type: String, required: true }
  }],
  buyerRequirements: [{ type: String }],
  thumbnail: {
    headline: { type: String, required: true },
    supportingText: { type: String, required: true },
    visualConcept: { type: String, required: true }
  },
  shortSummary: { type: String, required: true },
  upsells: [{ type: String }],
  strategyExplanation: {
    positioning: { type: String, required: true },
    targetBuyer: { type: String, required: true },
    differentiation: { type: String, required: true },
    pricingLogic: { type: String, required: true }
  }
}, { _id: false });

const GigDraftSchema = new Schema<IGigDraft>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    serviceType: {
      type: String,
      required: true
    },
    rawDescription: {
      type: String,
      required: true
    },
    technologies: {
      type: [String],
      required: true,
      default: []
    },
    targetBuyer: {
      type: String,
      required: true
    },
    experienceLevel: {
      type: String,
      required: true
    },
    pricingPreference: {
      type: String,
      required: true
    },
    researchData: {
      type: CompetitorResearchSchema,
      required: true,
      default: {}
    },
    generatedContent: {
      type: GeneratedContentSchema
    },
    status: {
      type: String,
      enum: ['draft', 'completed'],
      default: 'draft'
    },
    version: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

export const GigDraft = model<IGigDraft>('GigDraft', GigDraftSchema);
