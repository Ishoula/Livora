import { Router } from "express";
import { deleteMessage, getMessagesForProperty, sendMessage } from "../controllers/message.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { deleteMessageParamsSchema, messageParamsSchema, sendMessageSchema } from "../validators/message.validator";

const router= Router()

router.post(
    "/property/:propertyId",
    authMiddleware(['buyer','seller','agent']),
    validate(messageParamsSchema, 'params'),
    validate(sendMessageSchema),
    sendMessage
)

router.get(
    '/property/:propertyId',
    authMiddleware(['buyer','seller','agent']),
    validate(messageParamsSchema, 'params'),
    getMessagesForProperty
)

router.delete(
    '/property/:messageId',
    authMiddleware(['buyer','seller','agent']),
    validate(deleteMessageParamsSchema, 'params'),
    deleteMessage
)
export default router;