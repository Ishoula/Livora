import { Response } from "express";
import { AppDataSource } from "../config/db";
import { Message } from "../entities/Message";
import { Property } from "../entities/Property";
import { Notification } from "../entities/Notification";
import { User } from "../entities/User";
import { AuthRequest } from "../middlewares/auth.middleware";
import { MessageParamsInput, SendMessageInput } from "../validators/message.validator";

export const sendMessage = async (req: AuthRequest, res: Response) => {
    try {
        const { propertyId } = req.params as unknown as MessageParamsInput;
        const { message, receiverId } = req.body as SendMessageInput;
        const sender = req.user;

        if (!sender?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const propertyRepo = AppDataSource.getRepository(Property);
        const messageRepo = AppDataSource.getRepository(Message);
        const notificationRepo = AppDataSource.getRepository(Notification);
        const userRepo = AppDataSource.getRepository(User);

        const property = await propertyRepo.findOne({ where: { id: propertyId }, relations: ["owner"] });
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        const propertyOwnerId = property.owner?.id;
        if (!propertyOwnerId) {
            return res.status(400).json({ message: "Property owner is missing" });
        }

        const isOwnerSending = sender.id === propertyOwnerId;

        let targetReceiverId = isOwnerSending ? receiverId : propertyOwnerId;

        if (!targetReceiverId || targetReceiverId === sender.id) {
            return res.status(400).json({ message: "A valid receiverId is required" });
        }

        if (isOwnerSending && !receiverId) {
            return res.status(400).json({ message: "receiverId is required when replying as the owner" });
        }

        const receiver = await userRepo.findOne({ where: { id: targetReceiverId } });
        if (!receiver) {
            return res.status(404).json({ message: "Receiver not found" });
        }

        if (isOwnerSending) {
            const priorConversationExists = await messageRepo.exists({
                where: {
                    property: { id: propertyId },
                    sender: { id: targetReceiverId }
                }
            });

            if (!priorConversationExists) {
                return res.status(403).json({ message: "Owner can only reply to users who contacted this property" });
            }
        }

        const newMessage = messageRepo.create({
            sender: { id: sender.id } as User,
            receiver: { id: targetReceiverId } as User,
            property,
            message,

        });

        const savedMessage = await messageRepo.save(newMessage);

        if (targetReceiverId !== sender.id) {
            const notification = notificationRepo.create({
                user: { id: targetReceiverId } as User,
                message: `You have received a new message about ${property.title}`,
                propertyId: property.id,
                messageId: savedMessage.id
            });
            await notificationRepo.save(notification);
        }

        res.status(201).json({
            id: savedMessage.id,
            message: savedMessage.message,
            senderId: sender.id,
            receiverId: targetReceiverId,
            propertyId: property.id,
            sentAt: savedMessage.sentAt,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        res.status(500).json({ message })
    }
}

export const getMessagesForProperty = async (req: AuthRequest, res: Response) => {
    const { propertyId } = req.params as unknown as MessageParamsInput;
    const repo = AppDataSource.getRepository(Message);

    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const messages = await repo.find({
        where: [
            { property: { id: propertyId }, sender: { id: userId } },
            { property: { id: propertyId }, receiver: { id: userId } }
        ],
        relations: ['sender', 'receiver'],
        order: { sentAt: 'ASC' }
    });

    return res.status(200).json(messages);
}

export const deleteMessage = async (req: AuthRequest, res: Response) => {
    try {
        const messageId = Number(req.params.messageId)
        if (isNaN(messageId)) {
            return res.status(400).json({ message: "Invalid messageId" })
        }
        const userId=req.user.id

        const messageRepo=AppDataSource.getRepository(Message)
        const message= await messageRepo.findOne({
            where:{id:messageId},
            relations:['sender']
        })

        if(!message){
            return res.status(404).json({message:"Message not found"})
        }
        if(message.sender.id!==userId){
            return res.status(403).json({message:"You have no permission to delete this message"})
        }

        await messageRepo.remove(message)
        return res.status(200).json({message:"Message deleted successfully"})
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}

export const resetMessages = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const repo = AppDataSource.getRepository(Message);
        await repo.delete([
            { sender: { id: userId } },
            { receiver: { id: userId } }
        ]);

        return res.status(200).json({ message: "Messages reset" });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        return res.status(500).json({ message });
    }
}