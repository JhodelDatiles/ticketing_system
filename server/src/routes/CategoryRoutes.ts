import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../controller/Authentication/JWTController.ts";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../controller/CategoriesController.ts";

const router = Router();

router.use(authenticateJWT);

router.get("/", getCategories);
router.post("/", authorizeRoles("admin"), createCategory);
router.patch("/:id", authorizeRoles("admin"), updateCategory);
router.delete("/:id", authorizeRoles("admin"), deleteCategory);

export default router;