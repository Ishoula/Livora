import { Router } from "express";
import { createProperty,deleteProperty,getProperties, getPropertyById, updateProperty} from "../controllers/property.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { propertyOwnerOnly } from "../middlewares/properOwner.middleware";

const router= Router()

/**
 * @openapi
 * /properties:
 *   get:
 *     summary: Retrieve all properties
 *     tags:
 *       - Properties
 *     responses:
 *       200:
 *         description: List of properties returned
 */
router.get('/',getProperties)

/**
 * @openapi
 * /properties/{id}:
 *   get:
 *     summary: Get a property by ID
 *     tags:
 *       - Properties
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Property identifier
 *     responses:
 *       200:
 *         description: Property details returned
 *       404:
 *         description: Property not found
 */
router.get('/:id',getPropertyById)

/**
 * @openapi
 * /properties:
 *   post:
 *     summary: Create a new property listing
 *     tags:
 *       - Properties
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               location:
 *                 type: string
 *             additionalProperties: true
 *     responses:
 *       201:
 *         description: Property created
 */
router.post('/',authMiddleware(['seller','agent']), createProperty)

/**
 * @openapi
 * /properties/{id}:
 *   delete:
 *     summary: Delete a property listing
 *     tags:
 *       - Properties
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Property deleted
 */
router.delete('/:id',authMiddleware(['seller','agent']),propertyOwnerOnly,deleteProperty)

/**
 * @openapi
 * /properties/{id}:
 *   put:
 *     summary: Update a property listing
 *     tags:
 *       - Properties
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Property updated
 */
router.put('/:id',authMiddleware(['seller','agent']),propertyOwnerOnly, updateProperty)

export default router;