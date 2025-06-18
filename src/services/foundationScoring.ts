import { FoundationRank, RiskFactors, FoundationPerformance } from "../models/foundation";

interface ScoringWeights {
  hydrostatic: number;
  hydrodynamic: number;
  scour: number;
  debris: number;
  regulatory_compliance: number;
  maintenance: number;
}

interface ZoneRestrictions {
  allowedFoundations: FoundationRank[];
  requiresOpenings: boolean;
  requiresBreakaway: boolean;
  scourResistance: 'high' | 'moderate' | 'low';
}

export class FoundationScoringService {
  private static defaultWeights: ScoringWeights = {
    hydrostatic: 0.25,
    hydrodynamic: 0.20,
    scour: 0.20,
    debris: 0.15,
    regulatory_compliance: 0.15,
    maintenance: 0.05
  };


  // only used a few neighborhoods, just in zone A and X, but have data for all zones here 
  private static zoneRequirements: Record<string, ZoneRestrictions> = {
    'V': {
      allowedFoundations: [FoundationRank.PILE_COLUMN, FoundationRank.PIER],
      requiresOpenings: false,
      requiresBreakaway: true,
      scourResistance: 'high'
    },
    'A_COASTAL': {
      allowedFoundations: [FoundationRank.PILE_COLUMN, FoundationRank.PIER, FoundationRank.RAISED_SLAB],
      requiresOpenings: true,
      requiresBreakaway: false,
      scourResistance: 'moderate'
    },
    'A': {
      allowedFoundations: [FoundationRank.PILE_COLUMN, FoundationRank.PIER, FoundationRank.RAISED_SLAB, FoundationRank.CRAWLSPACE, FoundationRank.SLAB_ON_GRADE],
      requiresOpenings: true,
      requiresBreakaway: false,
      scourResistance: 'low'
    },
    'AE': {
      allowedFoundations: [FoundationRank.PILE_COLUMN, FoundationRank.PIER, FoundationRank.RAISED_SLAB, FoundationRank.CRAWLSPACE, FoundationRank.SLAB_ON_GRADE],
      requiresOpenings: true,
      requiresBreakaway: false,
      scourResistance: 'low'
    },
    'X': {
      allowedFoundations: [
  FoundationRank.PILE_COLUMN,
  FoundationRank.PIER,
  FoundationRank.RAISED_SLAB,
  FoundationRank.CRAWLSPACE,
  FoundationRank.SLAB_ON_GRADE,
  FoundationRank.BASEMENT
],
      requiresOpenings: false,
      requiresBreakaway: false,
      scourResistance: 'low'
    }
  };

  static calculateFoundationScore(
    foundation: FoundationPerformance,
    floodZone: string,
    weights: ScoringWeights = this.defaultWeights
  ): number {
    let score = 0;
    
    // base performance score 
    score += foundation.hydrostatic_resistance * weights.hydrostatic * 100;
    score += foundation.hydrodynamic_resistance * weights.hydrodynamic * 100;
    score += foundation.scour_resistance * weights.scour * 100;
    score += foundation.debris_resistance * weights.debris * 100;
    
    // if we're under regulatory compliance, give bonus/penalty
    const zoneReqs = this.zoneRequirements[floodZone];
    if (zoneReqs?.allowedFoundations.includes(foundation.rank)) {
      score += weights.regulatory_compliance * 100;
    } else {
      score -= weights.regulatory_compliance * 50;
    }
    
    // if our materials degrade more slowly, give higher score 
    const maintenanceScore = (1 - foundation.annual_degradation_rate / 0.035) * 100;
    score += maintenanceScore * weights.maintenance;
    
    return Math.max(0, Math.min(100, score));
  }

  static applyRiskAdjustments(baseScore: number, factors: RiskFactors): number {
    let adjustedScore = baseScore;
    
    // give bonus for elevation - per FEMA, this is very important
    adjustedScore += Math.min(15, factors.elevation_above_bfe * 2.5);
    
    // when  we have real water proximity data, use it to penalize waterfront property
    if (factors.proximity_to_water < 0.1) adjustedScore -= 10;
    else if (factors.proximity_to_water < 0.5) adjustedScore -= 5;
    
    // adjustment for drainage quality
    const drainageAdjustment = {
      'poor': -5,
      'fair': 0,
      'good': +3
    };
    adjustedScore += drainageAdjustment[factors.local_drainage];
    
    // subsidence penalty (louisiana-specific)
    adjustedScore -= factors.subsidence_rate * 10;
    
    return Math.max(0, Math.min(100, adjustedScore));
  }

}
