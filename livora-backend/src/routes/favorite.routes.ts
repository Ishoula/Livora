import { Router } from "express";
import { addFavorite, getFavorites, removeFavorite } from "../controllers/favorite.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router=Router()

router.get('/',authMiddleware(['buyer']),getFavorites)
router.post('/',authMiddleware(['buyer']), addFavorite)
router.delete('/:propertyId', authMiddleware(['buyer']), removeFavorite)
export default router;
