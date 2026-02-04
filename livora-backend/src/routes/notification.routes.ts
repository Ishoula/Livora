import { Router } from "express";
import { deleteNotification, getNotifications, markAsRead } from "../controllers/notification.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { notificationParamsSchema } from "../validators/notification.validator";

const router= Router()
router.get('/',authMiddleware(['buyer','seller','agent']),getNotifications)
router.put("/:id/read",authMiddleware(),markAsRead)
router.delete(
    '/:notificationId',
    authMiddleware(),
    validate(notificationParamsSchema, 'params'),
    deleteNotification
)
export default router;
