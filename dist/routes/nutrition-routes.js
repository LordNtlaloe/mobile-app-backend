"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const nutrition_controller_1 = require("../controllers/nutrition-controller");
const router = express_1.default.Router();
router.post("/", nutrition_controller_1.createNutritionLog);
router.post("/bulk", nutrition_controller_1.bulkCreateNutritionLogs);
router.get("/:id", nutrition_controller_1.getNutritionLogById);
router.get("/client/:clientId", nutrition_controller_1.getClientNutritionLogs);
router.get("/client/:clientId/date/:date", nutrition_controller_1.getNutritionLogsByDate);
router.put("/:id", nutrition_controller_1.updateNutritionLog);
router.delete("/:id", nutrition_controller_1.deleteNutritionLog);
router.get("/client/:clientId/summary", nutrition_controller_1.getNutritionSummary);
exports.default = router;
//# sourceMappingURL=nutrition-routes.js.map