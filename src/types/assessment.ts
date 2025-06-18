import { NeighborhoodData, FoundationPerformance} from "../models/foundation";

// What the user passes in from the FE
export interface BuildingInput {
  neighborhood: string;
  foundationType: string;
  elevation: number;
  materials: string;
  floodMitigation: string;
}

// What's returned from the API and presented to the user
export interface ResilienceAssessment {
  resilienceScore: number;
  confidenceInterval: [number, number];
  timeline: PerformancePoint[];
  recommendations: Recommendation[];
  summary: string;
  neighborhood: string;
  riskFactors: string[];
  foundationAnalysis: FoundationAnalysis;
  mitigationEffectiveness: MitigationAnalysis;
}

// Estimated performance at a given year(2025, 2030, etc)
export interface PerformancePoint {
  year: number;
  score: number;
  conditions: 'excellent' | 'good' | 'fair' | 'poor';
  riskLevel: 'low' | 'moderate' | 'high' | 'extreme';
  primaryRisks: string[];
}

// Recommendations to the user to improve flood resilience
export interface Recommendation {
  action: string;
  priority: 'high' | 'medium' | 'low';
  costRange: {
    min: number;
    max: number;
  };
  benefit: string;
  timeframe: string;
  roi: number;
  type: 'structural' | 'material' | 'elevation' | 'mitigation';
  feasibility: 'easy' | 'moderate' | 'complex';
}

// Analysis of the performance of the chosen foundation
export interface FoundationAnalysis {
  currentRating: string;
  strengthScore: number;
  weaknesses: string[];
  regulatoryCompliance: boolean;
}

// Analysis of chosen mitigation methods, if any
export interface MitigationAnalysis {
  currentFeatures: string[];
  effectivenessScore: number;
  missingFeatures: string[];
  costBenefit: Array<{
    feature: string;
    cost: number;
    benefit: number;
    priority: string;
  }>;
}

// data model for LLM response
export interface LLMContext {
  input: BuildingInput;
  foundationScore: number;
  overallScore: number;
  timeline: PerformancePoint[];
  neighborhood: NeighborhoodData;
  foundation: FoundationPerformance;
  riskFactors: string[];
}


