import { Router } from "express";
import { getProfile,getAllUsers, deleteUser } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminOnly } from "../middlewares/admin.middleware";

const router=Router()

router.get('/profile',authMiddleware(),getProfile)
router.get('/',authMiddleware(),adminOnly,getAllUsers)
router.delete('/:id',authMiddleware(),adminOnly,deleteUser)

export default router;