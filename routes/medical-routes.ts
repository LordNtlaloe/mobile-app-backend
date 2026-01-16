// routes/medical-routes.ts
import express from 'express';
import * as medicalController from '../controllers/medicals-controller';
import { authenticate, authorize, authorizeSelfOrAdmin } from '../middleware/auth';

const router = express.Router();

// All medical routes require authentication
router.use(authenticate);

// Medical conditions
router.post('/:clientId/conditions', authorizeSelfOrAdmin('clientId'), medicalController.addMedicalCondition);
router.get('/:clientId/conditions', authorizeSelfOrAdmin('clientId'), medicalController.getMedicalConditions);
router.put('/:clientId/conditions/:id', authorizeSelfOrAdmin('clientId'), medicalController.updateMedicalCondition);
router.delete('/:clientId/conditions/:id', authorizeSelfOrAdmin('clientId'), medicalController.deleteMedicalCondition);

// Allergies
router.post('/:clientId/allergies', authorizeSelfOrAdmin('clientId'), medicalController.addAllergy);
router.get('/:clientId/allergies', authorizeSelfOrAdmin('clientId'), medicalController.getAllergies);
router.put('/:clientId/allergies/:id', authorizeSelfOrAdmin('clientId'), medicalController.updateAllergy);
router.delete('/:clientId/allergies/:id', authorizeSelfOrAdmin('clientId'), medicalController.deleteAllergy);

// Medications
router.post('/:clientId/medications', authorizeSelfOrAdmin('clientId'), medicalController.addMedication);
router.get('/:clientId/medications', authorizeSelfOrAdmin('clientId'), medicalController.getMedications);
router.put('/:clientId/medications/:id', authorizeSelfOrAdmin('clientId'), medicalController.updateMedication);
router.delete('/:clientId/medications/:id', authorizeSelfOrAdmin('clientId'), medicalController.deleteMedication);

// Injuries
router.post('/:clientId/injuries', authorizeSelfOrAdmin('clientId'), medicalController.addInjury);
router.get('/:clientId/injuries', authorizeSelfOrAdmin('clientId'), medicalController.getInjuries);
router.put('/:clientId/injuries/:id', authorizeSelfOrAdmin('clientId'), medicalController.updateInjury);
router.delete('/:clientId/injuries/:id', authorizeSelfOrAdmin('clientId'), medicalController.deleteInjury);

// Fitness goals
router.post('/:clientId/goals', authorizeSelfOrAdmin('clientId'), medicalController.addFitnessGoal);
router.get('/:clientId/goals', authorizeSelfOrAdmin('clientId'), medicalController.getFitnessGoals);
router.put('/:clientId/goals/:id', authorizeSelfOrAdmin('clientId'), medicalController.updateFitnessGoal);
router.put('/:clientId/goals/:id/achieve', authorizeSelfOrAdmin('clientId'), medicalController.markGoalAsAchieved);
router.delete('/:clientId/goals/:id', authorizeSelfOrAdmin('clientId'), medicalController.deleteFitnessGoal);

// Dietary restrictions
router.post('/:clientId/dietary-restrictions', authorizeSelfOrAdmin('clientId'), medicalController.addDietaryRestriction);
router.get('/:clientId/dietary-restrictions', authorizeSelfOrAdmin('clientId'), medicalController.getDietaryRestrictions);
router.put('/:clientId/dietary-restrictions/:id', authorizeSelfOrAdmin('clientId'), medicalController.updateDietaryRestriction);
router.delete('/:clientId/dietary-restrictions/:id', authorizeSelfOrAdmin('clientId'), medicalController.deleteDietaryRestriction);

// Bulk health info upload
router.post('/:clientId/health-info', authorizeSelfOrAdmin('clientId'), medicalController.addClientHealthInfo);

export default router;