import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

type RequestPart = "body" | "params" | "query";

export const validate = (schema: ZodSchema, part: RequestPart = "body") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = schema.safeParse(req[part]);

    if (!data.success) {
      const { fieldErrors, formErrors } = data.error.flatten();
      return res.status(400).json({
        message: "Validation failed",
        errors: {
          fields: fieldErrors,
          form: formErrors,
        },
      });
    }

    req[part] = data.data;
    next();
  };
};
