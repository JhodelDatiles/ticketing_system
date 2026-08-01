import { Router } from "express";
import { authenticateJWT } from "../controller/Authentication/JWTController.ts";
import { deleteComment } from "../controller/CommentsController.ts";

const router = Router();

router.use(authenticateJWT);
router.delete("/:id", deleteComment);

export default router;