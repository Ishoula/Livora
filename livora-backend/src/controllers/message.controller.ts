import { Response } from "express";
import { AppDataSource } from "../config/db";
import { Message } from "../entities/Message";
import { Property } from "../entities/Property";
import { Notification } from "../entities/Notification";
import { AuthRequest } from "../middlewares/auth.middleware";

export const sendMessage = async (req: AuthRequest, res: Response) => {
    try {
        const {  propertyId, message } = req.body
        const sender=req.user;
        const propertyRepo = AppDataSource.getRepository(Property)
        const messageRepo = AppDataSource.getRepository(Message)
        const notificationRepo=AppDataSource.getRepository(Notification)
        const property = await propertyRepo.findOne({ where: { id: propertyId }, relations: ["owner"] })
        if (!property) return res.status(404).json({ message: "Property not found" })

        const receiverId = property.owner.id;
        const newMessage = messageRepo.create({
            sender: { id: sender.id },
            receiver: { id: receiverId },
            property: { id: property.id },
            message,

        })

        await messageRepo.save(newMessage)

        if(property.owner && property.owner.id!==sender.id){
            const notification=notificationRepo.create({
                user: {id:property.owner.id},
                message: `You have received a new message about ${property.title}`
            })
            await notificationRepo.save(notification)
        }

        res.status(200).json(newMessage)
    } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        res.status(500).json({ message })
    }
}

export const getMessagesForProperty = async (req: any, res: Response) => {
    const repo = AppDataSource.getRepository(Message)

    const message = await repo.find({
        where: { property: { id: req.params.propertyId } },
        relations: ['sender', 'receiver']

    })

    res.status(200).json(message)
}