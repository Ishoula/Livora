import { Router } from "express";
import { getNotifications, markAsRead } from "../controllers/notification.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router= Router()
/**
 * @openapi
 * /notifications:
 *   get:
 *     summary: Retrieve notifications for the authenticated user
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 */
router.get('/',authMiddleware(['buyer','seller','agent']),getNotifications)
/**
 * @openapi
 * /notifications/{id}/read:
 *   put:
 *     summary: Mark a notification as read
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Notification identifier
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.put("/:id/read",authMiddleware(),markAsRead)
export default router;
