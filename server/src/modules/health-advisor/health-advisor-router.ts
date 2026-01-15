import { Router } from 'express';
import { healthAdvisorController } from './health-advisor-controller';

const router = Router();

// Get personalized health advice
router.post('/advice', (req, res) => healthAdvisorController.getAdvice(req, res));

// Seed initial knowledge (Admin/Dev only in production)
router.post('/seed-knowledge', (req, res) => healthAdvisorController.seedKnowledge(req, res));

export default router;
