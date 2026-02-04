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

export const markAsRead= async(req:any, res:Response)=>{
    const repo= AppDataSource.getRepository(Notification)
    await repo.update(req.params.id,{isRead:true})
    res.json({message:"Notification marked as read"})
}

export const deleteNotification= async(req:AuthRequest, res:Response)=>{
    try {
        const notificationId = Number(req.params.notificationId)
        if (isNaN(notificationId)) {
            return res.status(400).json({ message: "Invalid notificationId" })
        }

        const userId = req.user?.id
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const notificationRepo=AppDataSource.getRepository(Notification)
        const notification= await notificationRepo.findOne({
            where:{id:notificationId, user:{id:userId}},
        })

        if(!notification){
            return res.status(404).json({message:"Notification not found"})
        }

        await notificationRepo.remove(notification)
        return res.status(200).json({message:"Notification deleted successfully"})
        
    } catch (error) {
        console.error(error)
        res.status(500).json({message:"Internal server error"})
    }
}