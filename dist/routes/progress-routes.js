"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const progress_controller_1 = require("../controllers/progress-controller");
const router = express_1.default.Router();
router.post("/:clientId/measurements", progress_controller_1.addMeasurement);
router.get("/:clientId/measurements", progress_controller_1.getMeasurements);
exports.default = router;
//# sourceMappingURL=progress-routes.js.map