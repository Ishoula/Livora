import { Router } from "express";
import { getProfile,getAllUsers, deleteUser, deleteMe } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminOnly } from "../middlewares/admin.middleware";

const router=Router()

router.get('/profile',authMiddleware(),getProfile)
router.delete('/me',authMiddleware(),deleteMe)
router.get('/',authMiddleware(),adminOnly,getAllUsers)
router.delete('/:id',authMiddleware(),adminOnly,deleteUser)

export default router;