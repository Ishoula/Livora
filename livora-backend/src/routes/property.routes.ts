import { Router } from "express";
import { createProperty,deleteProperty,getProperties, getPropertyById, updateProperty} from "../controllers/property.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { propertyOwnerOnly } from "../middlewares/properOwner.middleware";

const router= Router()

router.get('/',getProperties)
router.get('/:id',getPropertyById)
router.post('/',createProperty)
router.delete('/:id',authMiddleware(['seller','agent']),propertyOwnerOnly,deleteProperty)
router.put('/:id',authMiddleware(['seller','agent']),propertyOwnerOnly, updateProperty)

export default router;