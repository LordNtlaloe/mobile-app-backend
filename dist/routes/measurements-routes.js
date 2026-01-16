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
const measurementController = __importStar(require("../controllers/measurement-controller"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.post('/:clientId', (0, auth_1.authorizeSelfOrAdmin)('clientId'), measurementController.createMeasurement);
router.get('/:clientId', (0, auth_1.authorizeSelfOrAdmin)('clientId'), measurementController.getClientMeasurements);
router.get('/:clientId/stats', (0, auth_1.authorizeSelfOrAdmin)('clientId'), measurementController.getMeasurementStats);
router.get('/:clientId/trends', (0, auth_1.authorizeSelfOrAdmin)('clientId'), measurementController.getMeasurementTrends);
router.get('/:clientId/latest', (0, auth_1.authorizeSelfOrAdmin)('clientId'), measurementController.getLatestMeasurement);
router.get('/:clientId/body-composition', (0, auth_1.authorizeSelfOrAdmin)('clientId'), measurementController.getBodyComposition);
router.get('/:clientId/dashboard', (0, auth_1.authorizeSelfOrAdmin)('clientId'), measurementController.getDashboardMetrics);
router.get('/:clientId/compare', (0, auth_1.authorizeSelfOrAdmin)('clientId'), measurementController.compareMeasurements);
router.post('/:clientId/bulk', (0, auth_1.authorizeSelfOrAdmin)('clientId'), measurementController.bulkCreateMeasurements);
router.get('/:clientId/export', (0, auth_1.authorizeSelfOrAdmin)('clientId'), measurementController.exportMeasurements);
router.get('/:clientId/:measurementId', (0, auth_1.authorizeSelfOrAdmin)('clientId'), measurementController.getMeasurement);
router.put('/:clientId/:measurementId', (0, auth_1.authorizeSelfOrAdmin)('clientId'), measurementController.updateMeasurement);
router.delete('/:clientId/:measurementId', (0, auth_1.authorizeSelfOrAdmin)('clientId'), measurementController.deleteMeasurement);
exports.default = router;
//# sourceMappingURL=measurements-routes.js.map