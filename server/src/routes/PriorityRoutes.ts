import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../controller/Authentication/JWTController.ts";
import { getPriorities, createPriority, updatePriority, deletePriority } from "../controller/PrioritiesController.ts";

const router = Router();

router.use(authenticateJWT);

router.get("/", getPriorities);
router.post("/", authorizeRoles("admin"), createPriority);
router.put("/:id", authorizeRoles("admin"), updatePriority);
router.delete("/:id", authorizeRoles("admin"), deletePriority);

export default router;