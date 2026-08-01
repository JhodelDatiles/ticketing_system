import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../controller/Authentication/JWTController.ts";
import {
  getTicketsByStatus,
  getTicketsByPriority,
  getAgentWorkload,
  getAverageResolutionTime,
} from "../controller/ReportsController.ts";

const router = Router();

router.use(authenticateJWT, authorizeRoles("admin", "agent"));

router.get("/by-status", getTicketsByStatus);
router.get("/by-priority", getTicketsByPriority);
router.get("/agent-workload", getAgentWorkload);
router.get("/resolution-time", getAverageResolutionTime);

export default router;