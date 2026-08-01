import { Router } from "express";
import { authenticateJWT } from "../controller/Authentication/JWTController.ts";
import { deleteAttachment } from "../controller/AttachmentsController.ts";

const router = Router();

router.use(authenticateJWT);
router.delete("/:id", deleteAttachment);

export default router;