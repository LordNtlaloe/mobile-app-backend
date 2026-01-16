"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const medicalController = __importStar(require("../controllers/medicals-controller"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.post('/:clientId/conditions', (0, auth_1.authorizeSelfOrAdmin)('clientId'), medicalController.addMedicalCondition);
router.get('/:clientId/conditions', (0, auth_1.authorizeSelfOrAdmin)('clientId'), medicalController.getMedicalConditions);
router.put('/:clientId/conditions/:id', (0, auth_1.authorizeSelfOrAdmin)('clientId'), medicalController.updateMedicalCondition);
router.delete('/:clientId/conditions/:id', (0, auth_1.authorizeSelfOrAdmin)('clientId'), medicalController.deleteMedicalCondition);
router.post('/:clientId/allergies', (0, auth_1.authorizeSelfOrAdmin)('clientId'), medicalController.addAllergy);
router.get('/:clientId/allergies', (0, auth_1.authorizeSelfOrAdmin)('clientId'), medicalController.getAllergies);
router.put('/:clientId/allergies/:id', (0, auth_1.authorizeSelfOrAdmin)('clientId'), medicalController.updateAllergy);
router.delete('/:clientId/allergies/:id', (0, auth_1.authorizeSelfOrAdmin)('clientId'), medicalController.deleteAllergy);
router.post('/:clientId/medications', (0, auth_1.authorizeSelfOrAdmin)('clientId'), medicalController.addMedication);
router.get('/:clientId/medications', (0, auth_1.authorizeSelfOrAdmin)('clientId'), medicalController.getMedications);
router.put('/:clientId/medications/:id', (0, auth_1.authorizeSelfOrAdmin)('clientId'), medicalController.updateMedication);
router.delete('/:clientId/medications/:id', (0, auth_1.authorizeSelfOrAdmin)('clientId'), medicalController.deleteMedication);
router.post('/:clientId/injuries', (0, auth_1.authorizeSelfOrAdmin)('clientId'), medicalController.addInjury);
router.get('/:clientId/injuries', (0, auth_1.authorizeSelfOrAdmin)('clientId'), medicalController.getInjuries);
router.put('/:clientId/injuries/:id', (0, auth_1.authorizeSelfOrAdmin)('clientId'), medicalController.updateInjury);
router.delete('/:clientId/injuries/:id', (0, auth_1.authorizeSelfOrAdmin)('clientId'), medicalController.deleteInjury);
router.post('/:clientId/goals', (0, auth_1.authorizeSelfOrAdmin)('clientId'), medicalController.addFitnessGoal);
router.get('/:clientId/goals', (0, auth_1.authorizeSelfOrAdmin)('clientId'), medicalController.getFitnessGoals);
router.put('/:clientId/goals/:id', (0, auth_1.authorizeSelfOrAdmin)('clientId'), medicalController.updateFitnessGoal);
router.put('/:clientId/goals/:id/achieve', (0, auth_1.authorizeSelfOrAdmin)('clientId'), medicalController.markGoalAsAchieved);
router.delete('/:clientId/goals/:id', (0, auth_1.authorizeSelfOrAdmin)('clientId'), medicalController.deleteFitnessGoal);
router.post('/:clientId/dietary-restrictions', (0, auth_1.authorizeSelfOrAdmin)('clientId'), medicalController.addDietaryRestriction);
router.get('/:clientId/dietary-restrictions', (0, auth_1.authorizeSelfOrAdmin)('clientId'), medicalController.getDietaryRestrictions);
router.put('/:clientId/dietary-restrictions/:id', (0, auth_1.authorizeSelfOrAdmin)('clientId'), medicalController.updateDietaryRestriction);
router.delete('/:clientId/dietary-restrictions/:id', (0, auth_1.authorizeSelfOrAdmin)('clientId'), medicalController.deleteDietaryRestriction);
router.post('/:clientId/health-info', (0, auth_1.authorizeSelfOrAdmin)('clientId'), medicalController.addClientHealthInfo);
exports.default = router;
//# sourceMappingURL=medical-routes.js.map