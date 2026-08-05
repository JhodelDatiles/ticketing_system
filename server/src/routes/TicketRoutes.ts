import { Router } from "express";
import { authenticateJWT, authorizeRoles  } from "../controller/Authentication/JWTController.ts";
import { createTicket } from "../controller/Tickets/CreateController.ts";
import { getTickets, getTicketById } from "../controller/Tickets/ViewController.ts";
import { updateTicket } from "../controller/Tickets/UpdateController.ts";
import { deleteTicket } from "../controller/Tickets/DeleteController.ts";
import { assignTicket } from "../controller/Tickets/AssignController.ts";
import { getCommentsByTicket, createComment } from "../controller/CommentsController.ts";
import { getAttachmentsByTicket, createAttachment } from "../controller/AttachmentsController.ts";
import { getTicketHistory } from "../controller/Tickets/TicketHistoryController.ts";
import { getTicketsForBoard } from "../controller/Tickets/BoardController.ts";
import { reorderTickets } from "../controller/Tickets/ReorderController.ts";



const router = Router();

router.use(authenticateJWT);

router.get("/", getTickets);
router.get("/board", authorizeRoles("admin", "agent"), getTicketsForBoard); 
router.put("/reorder", authorizeRoles("admin", "agent"), reorderTickets); 
router.get("/:id", getTicketById);  
router.get("/:ticketId/history", authenticateJWT, getTicketHistory);
router.post("/", createTicket);
router.put("/:id", updateTicket);
router.delete("/:id", deleteTicket);
router.put("/:id/assign", authorizeRoles("admin", "agent"), assignTicket);

router.get("/:ticketId/comments", getCommentsByTicket);
router.post("/:ticketId/comments", createComment);

router.get("/:ticketId/attachments", getAttachmentsByTicket);
router.post("/:ticketId/attachments", createAttachment);

export default router;