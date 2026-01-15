import { Request, Response } from 'express';
import { healthAdvisorService } from './health-advisor-service';
import { knowledgeIngestionService } from '../../services/knowledge-ingestion-service';

export class HealthAdvisorController {
  /**
   * Get personalized health advice.
   */
  async getAdvice(req: Request, res: Response) {
    try {
      const clerkId = req.auth?.userId;
      if (!clerkId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query is required and must be a string' });
      }

      console.log(`🏥 Health Advisor query from ${clerkId}: ${query}`);
      const advice = await healthAdvisorService.getHealthAdvice(clerkId, query);

      res.json({
        success: true,
        data: advice
      });
    } catch (error: any) {
      console.error('Health Advisor error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get health advice'
      });
    }
  }

  /**
   * Seed initial knowledge base (Internal Use).
   */
  async seedKnowledge(req: Request, res: Response) {
    try {
      // In a real app, this would be admin-only
      await knowledgeIngestionService.seedInitialKnowledge();
      res.json({ success: true, message: 'Knowledge base seeded successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export const healthAdvisorController = new HealthAdvisorController();
