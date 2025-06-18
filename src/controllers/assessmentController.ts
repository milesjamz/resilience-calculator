import { Request, Response } from 'express';
import { z } from 'zod';
import { AssessmentService } from '../services/assessmentService';
import { FloodDataModel } from '../models/floodData';

// Validate input from FE
const BuildingInputSchema = z.object({
  neighborhood: z.string(),
  foundationType: z.string(),
  elevation: z.number().min(0).max(50),
  materials: z.string(),
  floodMitigation: z.string(),
});

export class AssessmentController {
  private assessmentService: AssessmentService;

  constructor() {
    this.assessmentService = new AssessmentService();
  }

  assess = async (req: Request, res: Response) => {
    try {
      const input = BuildingInputSchema.parse(req.body);
      const assessment = await this.assessmentService.assessBuilding(input);
      
      res.json({
        success: true,
        data: assessment,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Assessment error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Assessment failed',
        timestamp: new Date().toISOString()
      });
    }
  };

  getNeighborhoods = async (req: Request, res: Response) => {
    try {
      const neighborhoods = Object.entries(FloodDataModel.neighborhoods).map(([key, value]) => ({
        id: key,
        name: value.name,
        baseBFE: value.baseBFE,
        floodZone: value.floodZone,
        riskLevel: value.stormSurgeRisk
      }));

      res.json({
        success: true,
        data: neighborhoods
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve neighborhoods'
      });
    }
  };

  getFoundationTypes = async (req: Request, res: Response) => {
    try {
      const foundations = Object.entries(FloodDataModel.foundationTypes).map(([key, value]) => ({
        id: key,
        name: value.name,
        rank: value.rank,
        vZoneAllowed: value.nfip_v_zone_allowed,
        aZoneAllowed: value.nfip_a_zone_allowed,
        costMultiplier: value.construction_cost_multiplier
      }));

      res.json({
        success: true,
        data: foundations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve foundation types'
      });
    }
  };

  getMaterials = async (req: Request, res: Response) => {
    try {
      const materials = Object.entries(FloodDataModel.materialTypes).map(([key, value]) => ({
        id: key,
        name: value.name,
        floodResistance: value.floodResistance
      }));

      res.json({
        success: true,
        data: materials
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve materials'
      });
    }
  };

  getMitigationOptions = async (req: Request, res: Response) => {
    try {
      const mitigations = Object.entries(FloodDataModel.mitigationFeatures).map(([key, value]) => ({
        id: key,
        name: value.name,
        effectiveness: value.effectiveness,
        cost: value.cost,
        required: value.nfip_required,
        description: value.description
      }));

      res.json({
        success: true,
        data: mitigations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve mitigation options'
      });
    }
  };

  getNeighborhoodDetails = async (req: Request, res: Response) => {
    try {
      const { neighborhoodId } = req.params;
      const neighborhood = FloodDataModel.neighborhoods[neighborhoodId];

      if (!neighborhood) {
        return res.status(404).json({
          success: false,
          error: 'Neighborhood not found'
        });
      }

      res.json({
        success: true,
        data: {
          ...neighborhood,
          id: neighborhoodId
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve neighborhood details'
      });
    }
  };
}
