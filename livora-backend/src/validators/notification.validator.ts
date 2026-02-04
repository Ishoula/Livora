import { z } from "zod";

export const notificationParamsSchema = z.object({
  notificationId: z.coerce
    .number({ message: "notificationId must be a number" })
    .int("notificationId must be an integer")
    .positive("notificationId must be positive"),
});

export type NotificationParamsInput = z.infer<typeof notificationParamsSchema>;
