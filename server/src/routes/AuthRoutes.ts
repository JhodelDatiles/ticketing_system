import { Router } from "express";
import { register } from "../controller/Authentication/RegisterController.ts";
import { login } from "../controller/Authentication/LoginController.ts";

const router = Router();

router.post("/register", register);
router.post("/login", login);

export default router;