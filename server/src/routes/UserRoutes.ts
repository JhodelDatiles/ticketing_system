import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../controller/Authentication/JWTController.ts";
import { createUser } from "../controller/Users/CreateUserController.ts";
import { getAdmins, updateAdmin, deleteAdmin } from "../controller/Users/AdminsController.ts";
import { getAgents, updateAgent, deleteAgent } from "../controller/Users/AgentsController.ts";
import { getCustomers, updateCustomer, deleteCustomer } from "../controller/Users/CustomersController.ts";

const router = Router();

router.use(authenticateJWT, authorizeRoles("admin"));

router.post("/", createUser);
// Admin routes
router.get("/admins", getAdmins);
router.put("/admins/:id", updateAdmin);
router.delete("/admins/:id", deleteAdmin);
// Agent routes
router.get("/agents", getAgents);
router.put("/agents/:id", updateAgent);
router.delete("/agents/:id", deleteAgent);
// Customer route
router.get("/customers", getCustomers);
router.put("/customers/:id", updateCustomer);
router.delete("/customers/:id", deleteCustomer);

export default router;