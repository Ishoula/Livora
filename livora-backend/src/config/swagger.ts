import path from "path";
import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "Livora API",
    version: "1.0.0",
    description: "API documentation for the Livora real-estate backend service.",
  },
  servers: [
    {
      url: "http://localhost:2727/api",
      description: "Local development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

const swaggerOptions = {
  swaggerDefinition,
  apis: [
    path.join(__dirname, "../routes/*.ts"),
    path.join(__dirname, "../controllers/*.ts"),
    path.join(__dirname, "../entities/*.ts"),
    path.join(__dirname, "../middlewares/*.ts"),
  ],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
