import { Router } from "express";
import { getNotifications, markAsRead } from "../controllers/notification.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router= Router()
router.get('/',authMiddleware(['buyer','seller','agent']),getNotifications)
router.put("/:id/read",authMiddleware(),markAsRead)
export default router;
