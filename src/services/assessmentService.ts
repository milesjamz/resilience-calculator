import { FoundationScoringService } from './foundationScoring';
import { BuildingInput } from '../types/assessment';
import { FloodDataModel } from '../models/floodData';
import { ResilienceAssessment, MitigationAnalysis, FoundationAnalysis, PerformancePoint } from '../types/assessment';
import { RiskFactors, FoundationPerformance, NeighborhoodData, MitigationFeature, FoundationRank } from '../models/foundation';
import { LLMService } from './llmService';

export class AssessmentService {
  private llmService: LLMService;

  constructor() {
    this.llmService = new LLMService();
  }


  async assessBuilding(input: BuildingInput): Promise<ResilienceAssessment> {
    const neighborhood = FloodDataModel.neighborhoods[input.neighborhood];
    const foundation = FloodDataModel.foundationTypes[input.foundationType];
    const material = FloodDataModel.materialTypes[input.materials];
    const mitigation = FloodDataModel.mitigationFeatures[input.floodMitigation];

    if (!neighborhood || !foundation || !material || !mitigation) {
      throw new Error('Invalid input parameters');
    }

    const riskFactors: RiskFactors = {
      elevation_above_bfe: Math.max(0, input.elevation - neighborhood.baseBFE),
      proximity_to_water: 0.5, // default, in real app, we'd calculate from real address
      local_drainage: 'fair', // same
      soil_type: 'mixed', // same
      subsidence_rate: neighborhood.subsidenceRate
    };

    const foundationScore = FoundationScoringService.calculateFoundationScore(
      foundation,
      neighborhood.floodZone
    );

    // apply risk adjustments based on neighborhood and foundation type
    const adjustedFoundationScore = FoundationScoringService.applyRiskAdjustments(
      foundationScore,
      riskFactors
    );

    // calculate overall resilience score, using mitigation techniques
    const baseScore = this.calculateOverallScore(
      adjustedFoundationScore,
      material,
      mitigation,
      neighborhood,
      riskFactors
    );

    // generate timeline from 2025 -> 2055
    const timeline = this.calculateTimeline(baseScore, foundation, neighborhood, material);

    // our foundation analysis
    const foundationAnalysis: FoundationAnalysis = {
      currentRating: this.getFoundationRating(foundationScore),
      strengthScore: foundationScore,
      weaknesses: this.identifyFoundationWeaknesses(foundation, neighborhood.floodZone),
      regulatoryCompliance: this.checkRegulatoryCompliance(foundation, neighborhood.floodZone),
    };

    // our mitigation analysis
    const mitigationAnalysis = this.analyzeMitigation(input, foundation);

    // create data object to send to an llm for more thorough analysis
    const llmContext = {
      input,
      foundationScore: adjustedFoundationScore,
      overallScore: baseScore,
      timeline,
      neighborhood,
      foundation,
      riskFactors: this.identifyRiskFactors(input, neighborhood, foundation)
    };

    const recommendations = await this.llmService.generateRecommendations(llmContext);
    const summary = await this.llmService.generateSummary(llmContext);

    return {
      resilienceScore: Math.round(baseScore),
      confidenceInterval: [Math.round(baseScore - 5), Math.round(baseScore + 5)],
      timeline,
      recommendations,
      summary,
      neighborhood: neighborhood.name,
      riskFactors: this.identifyRiskFactors(input, neighborhood, foundation),
      foundationAnalysis,
      mitigationEffectiveness: mitigationAnalysis
    };
  }

  private calculateOverallScore(
    foundationScore: number,
    material: any,
    mitigation: MitigationFeature,
    neighborhood: NeighborhoodData,
    riskFactors: RiskFactors
  ): number {
    let score = foundationScore * 0.5; // foundation accounts for 50%
    score += material.floodResistance * 20;  // building material accounts for 20%
    score += mitigation.effectiveness * 15; // mitigation accounts for 15%
    const elevationBonus = Math.min(10, riskFactors.elevation_above_bfe * 2) // elevation accounts for 10%
    score += elevationBonus;
    score += (2 - neighborhood.riskMultiplier) * 5; // neighborhood risk contributes 5%

    return Math.max(10, Math.min(100, score));
  }

  private calculateTimeline(
    baseScore: number,
    foundation: FoundationPerformance,
    neighborhood: NeighborhoodData,
    material: any
  ): PerformancePoint[] {
    const timeline: PerformancePoint[] = [];
    let currentScore = baseScore;

    for (let year = 2025; year <= 2055; year += 5) {
      const yearsElapsed = year - 2025;

      // account for sea level rising + subsidence
      const sealevelImpact = 1 - (neighborhood.sealevelrise2055 * (yearsElapsed / 30) * 0.08);
      const subsidenceImpact = 1 - (neighborhood.subsidenceRate * yearsElapsed * 0.02);

      // account for materials to degrade
      const foundationDegradation = 1 - (foundation.annual_degradation_rate * yearsElapsed);
      const materialDegradation = 1 - (material.degradationRate * yearsElapsed);

      const adjustedScore = Math.max(
        10,
        Math.round(
          currentScore * sealevelImpact * subsidenceImpact * foundationDegradation * materialDegradation
        )
      );

      const primaryRisks = this.identifyTimelineRisks(adjustedScore, yearsElapsed, neighborhood);

      timeline.push({
        year,
        score: adjustedScore,
        conditions: this.getConditionsRating(adjustedScore),
        riskLevel: this.getRiskLevel(adjustedScore, yearsElapsed),
        primaryRisks
      });
    }

    return timeline;
  }

  private getFoundationRating(score: number): string {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 55) return 'Fair';
    if (score >= 40) return 'Poor';
    return 'Very Poor';
  }

  private identifyFoundationWeaknesses(foundation: FoundationPerformance, zone: string): string[] {
    const weaknesses: string[] = [];

    if (foundation.hydrostatic_resistance < 0.7) {
      weaknesses.push('Poor hydrostatic pressure resistance');
    }
    if (foundation.scour_resistance < 0.6) {
      weaknesses.push('Vulnerable to scour and erosion');
    }
    if (foundation.debris_resistance < 0.6) {
      weaknesses.push('Susceptible to debris impact damage');
    }
    if (!foundation.nfip_v_zone_allowed && zone === 'V') {
      weaknesses.push('Not permitted in V-zone flood areas');
    }

    return weaknesses;
  }

  private checkRegulatoryCompliance(foundation: FoundationPerformance, zone: string): boolean {
    const zoneReqs = FoundationScoringService['zoneRequirements'][zone];
    return zoneReqs?.allowedFoundations.includes(foundation.rank) ?? true;
  }

  private analyzeMitigation(input: BuildingInput, foundation: FoundationPerformance): MitigationAnalysis {
    const currentMitigation = FloodDataModel.mitigationFeatures[input.floodMitigation];
    const allMitigations = Object.values(FloodDataModel.mitigationFeatures);

    const applicable = allMitigations.filter(m =>
      m.applicableFoundations.includes(foundation.rank) && m.name !== currentMitigation.name
    );

    const costBenefit = applicable.map(m => ({
      feature: m.name,
      cost: m.cost,
      benefit: m.effectiveness * 100,
      priority: m.effectiveness > 0.15 ? 'high' : m.effectiveness > 0.08 ? 'medium' : 'low'
    }));

    return {
      currentFeatures: [currentMitigation.name],
      effectivenessScore: Math.round(currentMitigation.effectiveness * 100),
      missingFeatures: applicable.map(m => m.name),
      costBenefit
    };
  }

  private identifyRiskFactors(
    input: BuildingInput,
    neighborhood: NeighborhoodData,
    foundation: FoundationPerformance
  ): string[] {
    const factors: string[] = [];

    if (input.elevation < neighborhood.baseBFE + 2) {
      factors.push('Low elevation relative to Base Flood Elevation');
    }

    if (neighborhood.subsidenceRate > 0.4) {
      factors.push('High land subsidence rate in area');
    }

    if (foundation.rank >= FoundationRank.SLAB_ON_GRADE) {
      factors.push('Foundation type vulnerable to flood forces');
    }

    if (neighborhood.stormSurgeRisk === 'high' || neighborhood.stormSurgeRisk === 'extreme') {
      factors.push('High storm surge risk area');
    }

    if (neighborhood.historicalEvents.some(event => event.includes('severe') || event.includes('catastrophic'))) {
      factors.push('History of significant flood events');
    }

    return factors;
  }

  private identifyTimelineRisks(score: number, yearsElapsed: number, neighborhood: NeighborhoodData): string[] {
    const risks: string[] = [];

    if (yearsElapsed >= 15 && neighborhood.sealevelrise2055 > 1.0) {
      risks.push('Sea level rise impacts');
    }

    if (yearsElapsed >= 10 && neighborhood.subsidenceRate > 0.4) {
      risks.push('Accelerating land subsidence');
    }

    if (score < 60) {
      risks.push('Structural degradation');
    }

    if (yearsElapsed >= 20) {
      risks.push('Climate change intensification');
    }

    return risks;
  }

  private getConditionsRating(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 55) return 'fair';
    return 'poor';
  }

  private getRiskLevel(score: number, yearsElapsed: number): 'low' | 'moderate' | 'high' | 'extreme' {
    const adjustedScore = score - (yearsElapsed * 0.5);
    if (adjustedScore >= 80) return 'low';
    if (adjustedScore >= 65) return 'moderate';
    if (adjustedScore >= 45) return 'high';
    return 'extreme';
  }
}
