import { Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { Message } from "../entities/Message";
import { Property } from "../entities/Property";
import { AuthRequest } from "../middlewares/auth.middleware";

export const sendMessage = async(req:AuthRequest, res:Response)=>{
    try{
        const {receivedId, propertyId, message }= req.body

        const propertyRepo= AppDataSource.getRepository(Property)
        const messageRepo= AppDataSource.getRepository(Message)

        const property= await propertyRepo.findOneBy({id:propertyId})
        if(!property) return res.status(404).json({message:"Property not found"})
        const newMessage= messageRepo.create({
            sender:{id:req.user.id},
            receiver:{id:receivedId},
            property,
            message,

        })

        await messageRepo.save(newMessage)
        res.status(200).json(newMessage)
    }catch(err){
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        res.status(500).json({message})
    }
}