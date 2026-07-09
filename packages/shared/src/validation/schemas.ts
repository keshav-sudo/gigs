import { z } from 'zod';

// Fiverr Package Zod validation schema
export const FiverrPackageSchema = z.object({
  name: z.string().min(1, 'Package name is required'),
  description: z.string().min(1, 'Package description is required'),
  price: z.number().nonnegative('Price must be greater than or equal to 0'),
  deliveryDays: z.number().int().positive('Delivery days must be at least 1'),
  revisions: z.number().int().nonnegative('Revisions must be at least 0'),
  features: z.array(z.string())
});

// Complete Generated Gig Content validation schema (requested from DeepSeek)
export const GeneratedGigContentSchema = z.object({
  gigTitle: z.string().min(1, 'Gig title is required'),
  alternativeTitles: z.array(z.string()),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().min(1, 'Subcategory is required'),
  searchTags: z.array(z.string()),
  seoKeywords: z.array(z.string()),
  packages: z.object({
    basic: FiverrPackageSchema,
    standard: FiverrPackageSchema,
    premium: FiverrPackageSchema
  }),
  description: z.string().min(1, 'Full gig description is required'),
  faqs: z.array(
    z.object({
      question: z.string().min(1, 'Question text is required'),
      answer: z.string().min(1, 'Answer text is required')
    })
  ),
  buyerRequirements: z.array(z.string()),
  thumbnail: z.object({
    headline: z.string().min(1, 'Thumbnail headline is required'),
    supportingText: z.string().min(1, 'Thumbnail supporting text is required'),
    visualConcept: z.string().min(1, 'Thumbnail visual concept is required')
  }),
  shortSummary: z.string().min(1, 'Short gig summary is required'),
  upsells: z.array(z.string()),
  strategyExplanation: z.object({
    positioning: z.string().min(1, 'Positioning logic is required'),
    targetBuyer: z.string().min(1, 'Target buyer reasoning is required'),
    differentiation: z.string().min(1, 'Differentiation logic is required'),
    pricingLogic: z.string().min(1, 'Pricing logic explanation is required')
  })
});

// Competitor research schema (Step 2 input)
export const CompetitorResearchDataSchema = z.object({
  competitorTitles: z.string().default(''),
  competitorPricing: z.string().default(''),
  commonKeywords: z.string().default(''),
  popularTags: z.string().default(''),
  competitorDescriptions: z.string().default(''),
  marketObservations: z.string().default('')
});

// Input fields for Step 1 creation schema
export const CreateGigDraftSchema = z.object({
  serviceType: z.string().min(1, 'Service type is required'),
  rawDescription: z.string().min(10, 'Service description must be at least 10 characters'),
  technologies: z.array(z.string()).min(1, 'At least one technology is required'),
  targetBuyer: z.string().min(1, 'Target buyer selection is required'),
  experienceLevel: z.string().min(1, 'Experience level is required'),
  pricingPreference: z.string().min(1, 'Pricing preference is required'),
  researchData: CompetitorResearchDataSchema.optional().default({})
});

// Auth endpoint validation schemas
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters')
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});
