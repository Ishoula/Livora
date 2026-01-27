import { Router } from "express";
import { sendMessage } from "../controllers/message.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router= Router()

router.post("/", authMiddleware(['buyer','seller','agent']),sendMessage)

export default router;