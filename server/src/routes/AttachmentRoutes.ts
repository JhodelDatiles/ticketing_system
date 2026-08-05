import { Router } from "express";
import { authenticateJWT } from "../controller/Authentication/JWTController.ts";
import { deleteAttachment, downloadAttachment } from "../controller/AttachmentsController.ts";

const router = Router();

router.use(authenticateJWT);
router.get("/:id/download", downloadAttachment);
router.delete("/:id", deleteAttachment);

export default router;