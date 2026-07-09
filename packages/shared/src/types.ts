// Shared TypeScript types for GigCraft AI

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Fiverr Package Structure
export interface FiverrPackage {
  name: string;
  description: string;
  price: number;
  deliveryDays: number;
  revisions: number;
  features: string[];
}

// Generated Content Schema for the complete Fiverr Gig details
export interface GeneratedGigContent {
  gigTitle: string;
  alternativeTitles: string[];
  category: string;
  subcategory: string;
  searchTags: string[];
  seoKeywords: string[];
  packages: {
    basic: FiverrPackage;
    standard: FiverrPackage;
    premium: FiverrPackage;
  };
  description: string;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  buyerRequirements: string[];
  thumbnail: {
    headline: string;
    supportingText: string;
    visualConcept: string;
  };
  shortSummary: string;
  upsells: string[];
  strategyExplanation: {
    positioning: string;
    targetBuyer: string;
    differentiation: string;
    pricingLogic: string;
  };
}

// Research/Competitor Data supplied in STEP 2 of Wizard
export interface CompetitorResearchData {
  competitorTitles: string;
  competitorPricing: string;
  commonKeywords: string;
  popularTags: string;
  competitorDescriptions: string;
  marketObservations: string;
}

// Complete Gig Draft Data Model structure
export interface GigDraft {
  id: string;
  userId: string;
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

// Generation History model
export interface GenerationHistory {
  id: string;
  userId: string;
  gigDraftId?: string;
  generationType: 'full_generation' | 'section_regeneration';
  input: any;
  output: any;
  model: string;
  createdAt: Date;
}

// Auth Request Payloads
export interface RegisterRequest {
  email: string;
  passwordHash: string; // Or raw password during request, we validate password in Express validators
  name: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

// Auth Response Payloads
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}
