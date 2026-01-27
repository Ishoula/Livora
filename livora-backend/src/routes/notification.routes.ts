import { Router } from "express";
import { getNotifications } from "../controllers/notification.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router= Router()
router.get('/',authMiddleware(['buyer','seller','agent']),getNotifications)
export default router;
