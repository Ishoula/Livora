import { Router } from "express";
import { getMessagesForProperty, sendMessage } from "../controllers/message.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { messageParamsSchema, sendMessageSchema } from "../validators/message.validator";

const router = Router()

/**
 * @openapi
 * /messages:
 *   post:
 *     summary: Send a message to a property owner
 *     tags:
 *       - Messages
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [propertyId, message]
 *             properties:
 *               propertyId:
 *                 type: integer
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 */
router.post(
    "/",
    authMiddleware(['buyer', 'seller', 'agent']),
    validate(sendMessageSchema),
    sendMessage
)

/**
 * @openapi
 * /messages/property/{propertyId}:
 *   get:
 *     summary: Fetch messages for a property conversation
 *     tags:
 *       - Messages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Property identifier
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 */
router.get(
    '/property/:propertyId',
    authMiddleware(['buyer', 'seller', 'agent']),
    validate(messageParamsSchema, 'params'),
    getMessagesForProperty
)
export default router;