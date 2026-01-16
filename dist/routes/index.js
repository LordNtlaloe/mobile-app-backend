"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_routes_1 = __importDefault(require("./auth-routes"));
const client_routes_1 = __importDefault(require("./client-routes"));
const staff_routes_1 = __importDefault(require("./staff-routes"));
const measurements_routes_1 = __importDefault(require("./measurements-routes"));
const medical_routes_1 = __importDefault(require("./medical-routes"));
const nutrition_routes_1 = __importDefault(require("./nutrition-routes"));
const dashboard_routes_1 = __importDefault(require("./dashboard-routes"));
const router = express_1.default.Router();
router.use('/auth', auth_routes_1.default);
router.use('/clients', client_routes_1.default);
router.use('/staff', staff_routes_1.default);
router.use('/measurements', measurements_routes_1.default);
router.use('/medical', medical_routes_1.default);
router.use('/nutrition', nutrition_routes_1.default);
router.use('/admin', dashboard_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map