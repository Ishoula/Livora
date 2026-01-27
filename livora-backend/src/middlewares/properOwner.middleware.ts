import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { AppDataSource } from "../config/db";
import { Property } from "../entities/Property";

export const propertyOwnerOnly= async(
    req:AuthRequest,
    res: Response,
    next:NextFunction
)=>{
    const propertyId= Number(req.params.id)
    const repo= AppDataSource.getRepository(Property)

    const property=await repo.findOne({
        where:{id:propertyId},
        relations:['owner']
    })

    if(!property){
        return res.status(404).json({message:"Property not foudn"})
    }

    if(property.owner.id !==req.user.id){
        return res.status(403).json({message:"Not property owner"})
    }

    next()
}