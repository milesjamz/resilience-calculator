export enum FoundationRank {
  PILE_COLUMN = 1,
  PIER = 2,
  RAISED_SLAB = 3,
  CRAWLSPACE = 4,
  SLAB_ON_GRADE = 5,
  BASEMENT = 6
}

// this data was derived via LLM, but from FEMA flood resistant materials PDF mentioned in the assessment doc
export interface FoundationPerformance {
  rank: FoundationRank;
  name: string;
  hydrostatic_resistance: number;
  hydrodynamic_resistance: number;
  scour_resistance: number;
  debris_resistance: number;
  nfip_v_zone_allowed: boolean;     // how our 'NFIP Compliant' rating is derived
  nfip_a_zone_allowed: boolean;     // how our 'NFIP Compliant' rating is derived
  annual_degradation_rate: number;
  maintenance_frequency: number;
  construction_cost_multiplier: number;
  insurance_impact: 'positive' | 'neutral' | 'negative';
}

export interface MitigationFeature {
  name: string;
  effectiveness: number;
  applicableFoundations: FoundationRank[];
  cost: number;
  nfip_required: boolean;
  maintenance_years: number;
  description: string;
}

export interface NeighborhoodData {
  name: string;
  baseBFE: number;
  riskMultiplier: number;
  sealevelrise2055: number;
  subsidenceRate: number;
  stormSurgeRisk: 'low' | 'moderate' | 'high' | 'extreme';
  floodZone: string;
  historicalEvents: string[];
}

export interface RiskFactors {
  elevation_above_bfe: number;
  proximity_to_water: number;
  local_drainage: 'poor' | 'fair' | 'good';
  soil_type: 'clay' | 'sand' | 'mixed';
  subsidence_rate: number;
}
