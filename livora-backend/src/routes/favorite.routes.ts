import { Router } from "express";
import { addFavorite, getFavorites, removeFavorite } from "../controllers/favorite.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router=Router()

router.get('/',authMiddleware(['buyer','seller','admin','agent']),getFavorites)
router.post('/:propertyId',authMiddleware(['buyer','seller','admin','agent']), addFavorite)
router.delete('/:propertyId', authMiddleware(['buyer','seller','admin','agent']), removeFavorite)
export default router;
