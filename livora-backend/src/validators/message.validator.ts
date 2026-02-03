import { z } from "zod";

export const sendMessageSchema = z.object({
  propertyId: z.coerce
    .number({ message: "propertyId must be a number" })
    .int("propertyId must be an integer")
    .positive("propertyId must be positive"),
  receiverId: z.coerce
    .number({ message: "receiverId must be a number" })
    .int("receiverId must be an integer")
    .positive("receiverId must be positive")
    .optional(),
  message: z
    .string({ message: "message is required" })
    .trim()
    .min(1, "message cannot be empty"),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const messageParamsSchema = z.object({
  propertyId: z.coerce
    .number({ message: "propertyId must be a number" })
    .int("propertyId must be an integer")
    .positive("propertyId must be positive"),
});

export type MessageParamsInput = z.infer<typeof messageParamsSchema>;
