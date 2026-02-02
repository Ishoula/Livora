import { Router } from "express";
import { getMessagesForProperty, sendMessage } from "../controllers/message.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { messageParamsSchema, sendMessageSchema } from "../validators/message.validator";

const router= Router()

router.post(
    "/",
    authMiddleware(['buyer','seller','agent']),
    validate(sendMessageSchema),
    sendMessage
)

router.get(
    '/property/:propertyId',
    authMiddleware(['buyer','seller','agent']),
    validate(messageParamsSchema, 'params'),
    getMessagesForProperty
)
export default router;