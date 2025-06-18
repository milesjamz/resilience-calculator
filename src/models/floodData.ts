import { FoundationRank, NeighborhoodData, FoundationPerformance, MitigationFeature } from "./foundation";

export class FloodDataModel {
  static neighborhoods: Record<string, NeighborhoodData> = {
    bywater: {
      name: 'Bywater',
      baseBFE: 8,
      riskMultiplier: 0.85,
      sealevelrise2055: 1.5,
      subsidenceRate: 0.31,
      stormSurgeRisk: 'moderate',
      floodZone: 'A',
      historicalEvents: ['Hurricane Katrina (minimal flooding)', 'Hurricane Ida (minor flooding)']
    },
    marigny: {
      name: 'Faubourg Marigny',
      baseBFE: 7,
      riskMultiplier: 0.88,
      sealevelrise2055: 1.5,
      subsidenceRate: 0.31,
      stormSurgeRisk: 'moderate',
      floodZone: 'A',
      historicalEvents: ['Hurricane Katrina (minimal flooding)']
    },
    frenchquarter: {
      name: 'French Quarter',
      baseBFE: 9,
      riskMultiplier: 0.75,
      sealevelrise2055: 1.5,
      subsidenceRate: 0.20,
      stormSurgeRisk: 'low',
      floodZone: 'X',
      historicalEvents: ['No major flooding in recent history']
    },
  };

  static foundationTypes: Record<string, FoundationPerformance> = {
    pile_column: {
      rank: FoundationRank.PILE_COLUMN,
      name: 'Pile/Column Foundation',
      hydrostatic_resistance: 0.95,
      hydrodynamic_resistance: 0.90,
      scour_resistance: 0.85,
      debris_resistance: 0.85,
      nfip_v_zone_allowed: true,
      nfip_a_zone_allowed: true,
      annual_degradation_rate: 0.008,
      maintenance_frequency: 20,
      construction_cost_multiplier: 2.5,
      insurance_impact: 'positive'
    },
    pier: {
      rank: FoundationRank.PIER,
      name: 'Pier Foundation',
      hydrostatic_resistance: 0.90,
      hydrodynamic_resistance: 0.85,
      scour_resistance: 0.75,
      debris_resistance: 0.80,
      nfip_v_zone_allowed: true,
      nfip_a_zone_allowed: true,
      annual_degradation_rate: 0.010,
      maintenance_frequency: 15,
      construction_cost_multiplier: 2.0,
      insurance_impact: 'positive'
    },
    raised_slab: {
      rank: FoundationRank.RAISED_SLAB,
      name: 'Raised Slab Foundation',
      hydrostatic_resistance: 0.70,
      hydrodynamic_resistance: 0.60,
      scour_resistance: 0.45,
      debris_resistance: 0.55,
      nfip_v_zone_allowed: false,
      nfip_a_zone_allowed: true,
      annual_degradation_rate: 0.015,
      maintenance_frequency: 12,
      construction_cost_multiplier: 1.3,
      insurance_impact: 'neutral'
    },
    crawlspace: {
      rank: FoundationRank.CRAWLSPACE,
      name: 'Crawlspace Foundation',
      hydrostatic_resistance: 0.65,
      hydrodynamic_resistance: 0.55,
      scour_resistance: 0.45,
      debris_resistance: 0.50,
      nfip_v_zone_allowed: false,
      nfip_a_zone_allowed: true,
      annual_degradation_rate: 0.020,
      maintenance_frequency: 10,
      construction_cost_multiplier: 1.1,
      insurance_impact: 'neutral'
    },
    slab_on_grade: {
      rank: FoundationRank.SLAB_ON_GRADE,
      name: 'Slab-on-Grade Foundation',
      hydrostatic_resistance: 0.40,
      hydrodynamic_resistance: 0.30,
      scour_resistance: 0.25,
      debris_resistance: 0.25,
      nfip_v_zone_allowed: false,
      nfip_a_zone_allowed: true,
      annual_degradation_rate: 0.025,
      maintenance_frequency: 8,
      construction_cost_multiplier: 1.0,
      insurance_impact: 'negative'
    },
    basement: {
      rank: FoundationRank.BASEMENT,
      name: 'Basement Foundation',
      hydrostatic_resistance: 0.15,
      hydrodynamic_resistance: 0.10,
      scour_resistance: 0.15,
      debris_resistance: 0.10,
      nfip_v_zone_allowed: false,
      nfip_a_zone_allowed: false,
      annual_degradation_rate: 0.035,
      maintenance_frequency: 5,
      construction_cost_multiplier: 1.2,
      insurance_impact: 'negative'
    }
  };

  static mitigationFeatures: Record<string, MitigationFeature> = {
    none: {
      name: 'No Mitigation Features',
      effectiveness: 0,
      applicableFoundations: [
  FoundationRank.PILE_COLUMN,
  FoundationRank.PIER,
  FoundationRank.RAISED_SLAB,
  FoundationRank.CRAWLSPACE,
  FoundationRank.SLAB_ON_GRADE,
  FoundationRank.BASEMENT
],
      cost: 0,
      nfip_required: false,
      maintenance_years: 0,
      description: 'No flood mitigation measures in place'
    },
    flood_vents: {
      name: 'Flood Vents/Openings',
      effectiveness: 0.15,
      applicableFoundations: [FoundationRank.CRAWLSPACE, FoundationRank.RAISED_SLAB],
      cost: 2500,
      nfip_required: true,
      maintenance_years: 2,
      description: 'Automatic flood openings that allow water pressure equalization'
    },
    breakaway_walls: {
      name: 'Breakaway Walls',
      effectiveness: 0.12,
      applicableFoundations: [FoundationRank.PILE_COLUMN, FoundationRank.PIER],
      cost: 8000,
      nfip_required: false,
      maintenance_years: 5,
      description: 'Walls designed to collapse under flood forces without damaging structure'
    },
    elevated_utilities: {
      name: 'Elevated Utilities',
      effectiveness: 0.08,
      applicableFoundations: [
  FoundationRank.PILE_COLUMN,
  FoundationRank.PIER,
  FoundationRank.RAISED_SLAB,
  FoundationRank.CRAWLSPACE,
  FoundationRank.SLAB_ON_GRADE,
  FoundationRank.BASEMENT
],
      cost: 4000,
      nfip_required: false,
      maintenance_years: 10,
      description: 'HVAC, electrical, and plumbing systems elevated above expected flood levels'
    },
    flood_resistant_materials: {
      name: 'Flood-Resistant Materials',
      effectiveness: 0.10,
      applicableFoundations: [
  FoundationRank.PILE_COLUMN,
  FoundationRank.PIER,
  FoundationRank.RAISED_SLAB,
  FoundationRank.CRAWLSPACE,
  FoundationRank.SLAB_ON_GRADE,
  FoundationRank.BASEMENT
],
      cost: 6000,
      nfip_required: false,
      maintenance_years: 15,
      description: 'FEMA Class 4/5 materials that resist flood damage'
    },
    dry_floodproofing: {
      name: 'Dry Floodproofing',
      effectiveness: 0.25,
      applicableFoundations: [FoundationRank.SLAB_ON_GRADE, FoundationRank.BASEMENT],
      cost: 15000,
      nfip_required: false,
      maintenance_years: 3,
      description: 'Waterproof barriers and sealants to prevent water entry'
    }
  };

  static materialTypes: Record<string, { name: string; floodResistance: number; degradationRate: number }> = {
    wood_frame: {
      name: 'Wood Frame/Vinyl Siding',
      floodResistance: 0.70,
      degradationRate: 0.025
    },
    brick_veneer: {
      name: 'Brick Veneer',
      floodResistance: 0.80,
      degradationRate: 0.020
    },
    concrete_block: {
      name: 'Concrete Block',
      floodResistance: 0.90,
      degradationRate: 0.015
    },
    metal_siding: {
      name: 'Metal Roof & Siding',
      floodResistance: 0.85,
      degradationRate: 0.018
    },
    fiber_cement: {
      name: 'Fiber Cement',
      floodResistance: 0.88,
      degradationRate: 0.016
    }
  };
}
