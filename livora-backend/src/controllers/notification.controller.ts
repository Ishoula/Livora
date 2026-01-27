import { Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { Notification } from "../entities/Notification";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getNotifications= async(req: AuthRequest, res: Response)=>{

    try{
        const notificationRepo= AppDataSource.getRepository(Notification)
        const notifications= await notificationRepo.find({
            where:{user:{id:req.user.id}}
        })

        res.status(200).json(notifications)
    }catch(err){
        const message= err instanceof Error ? err.message: "Internal server error"
        return res.status(500).json(message)
    }
}