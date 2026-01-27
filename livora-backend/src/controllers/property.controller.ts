import { Response } from "express";
import { AppDataSource } from "../config/db";
import { Property } from "../entities/Property";
import { AuthRequest } from "../middlewares/auth.middleware";

export const createProperty = async (req: AuthRequest, res: Response) => {
    try {
        const propertyRepo = AppDataSource.getRepository(Property)
        const property = propertyRepo.create({ ...req.body, owner: { id: req.user.id } })
        await propertyRepo.save(property)
        res.json(property)

    } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        res.status(500).json({ message })
    }
}

export const getProperties= async (req: AuthRequest, res: Response) => {
    try {
        const propertyRepo = AppDataSource.getRepository(Property)
        const properties = await propertyRepo.find({ relations: ['owner', 'images'] })
        res.json(properties)
    } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        res.status(500).json({ message })
    }
}

export const getPropertyById = async (req: AuthRequest, res: Response) => {
    try {

        const id= Number(req.params.id)
        if(isNaN(id)){
            return res.status(400).json({message:"Invalid property Id"})
        }
        const propertyRepo = AppDataSource.getRepository(Property)
        const property = await propertyRepo.findOne({
            where: { id },
            relations:['owner','image']
        })
        if(!property){
            return res.status(404).json({message:"Property not found"})
        }
        res.status(200).json(property)
    } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        res.status(500).json({ message })
    }
}

export const updateProperty= async(req:any, res:Response)=>{
   try{
     const id= Number(req.params.id)
    if(isNaN(id)){
        return res.status(400).json({message:"Invalid property Id"})
    }
    const repo=AppDataSource.getRepository(Property)
    await repo.update(id, req.body)
    const updated=await repo.findOneBy({id})

    res.status(200).json(updated)
}catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        res.status(500).json({ message })
    }
}

export const deleteProperty = async(req: any, res:Response)=>{
    try{
        const id= Number(req.params.id)
    if(isNaN(id)){
        return res.status(400).json({message:"Invalid property Id"})
    }
        const repo=AppDataSource.getRepository(Property)
        await repo.delete({id})
        res.status(200).json({message:"Property deleted"})
    }catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        res.status(500).json({ message })
    }
}