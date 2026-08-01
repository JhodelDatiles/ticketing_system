import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../controller/Authentication/JWTController.ts";
import { getStatuses, createStatus, updateStatus, deleteStatus } from "../controller/StatusesController.ts";

const router = Router();

router.use(authenticateJWT);

router.get("/", getStatuses);
router.post("/", authorizeRoles("admin"), createStatus);
router.put("/:id", authorizeRoles("admin"), updateStatus);
router.delete("/:id", authorizeRoles("admin"), deleteStatus);

export default router;