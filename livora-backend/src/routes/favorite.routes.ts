import { Router } from "express";
import { addFavorite } from "../controllers/favorite.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router=Router()

router.post('/',authMiddleware(['buyer']), addFavorite)
export default router;
