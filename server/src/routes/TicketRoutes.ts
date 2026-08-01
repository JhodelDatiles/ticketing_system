import { Router } from "express";
import { authenticateJWT } from "../controller/Authentication/JWTController.ts";
import { createTicket } from "../controller/Tickets/CreateController.ts";
import { getTickets, getTicketById } from "../controller/Tickets/ViewController.ts";
import { updateTicket } from "../controller/Tickets/UpdateController.ts";
import { deleteTicket } from "../controller/Tickets/DeleteController.ts";
import { assignTicket } from "../controller/Tickets/AssignController.ts";
import { getCommentsByTicket, createComment } from "../controller/CommentsController.ts";
import { getAttachmentsByTicket, createAttachment } from "../controller/AttachmentsController.ts";

const router = Router();

router.use(authenticateJWT);

router.get("/", getTickets);
router.get("/:id", getTicketById);
router.post("/", createTicket);
router.patch("/:id", updateTicket);
router.delete("/:id", deleteTicket);
router.patch("/:id/assign", assignTicket);

router.get("/:ticketId/comments", getCommentsByTicket);
router.post("/:ticketId/comments", createComment);

router.get("/:ticketId/attachments", getAttachmentsByTicket);
router.post("/:ticketId/attachments", createAttachment);

export default router;