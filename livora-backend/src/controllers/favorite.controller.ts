import { Request,Response } from "express";
import { AppDataSource } from "../config/db";
import { Favorite } from "../entities/Favorite";    
import { Property } from "../entities/Property";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Auth } from "typeorm";

export const addFavorite= async(req: AuthRequest, res: Response)=>{
    try{
        const id= Number(req.params.propertyId)
        if(isNaN(id)){
            return res.status(400).json({message:"Invalid property Id"})
        }

        const favoriteRepo=AppDataSource.getRepository(Favorite)
        const propertyRepo=AppDataSource.getRepository(Property)

        const property=await propertyRepo.findOneBy({id})
        if(!property) return res.status(404).json({message:"Property not found"})
        
        const favorite= favoriteRepo.create({user: {id:req.user.id}, property})
        await favoriteRepo.save(favorite)
        res.status(200).json(favorite)
    }catch(err){
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        res.status(500).json({message})
    }
}

export const removeFavorite=async(req:any, res:Response)=>{
    const propertyId= Number(req.params.propertyId)
    if(isNaN(propertyId)){
        return res.status(400).json({message:"Invalid property Id"})
    }
    const repo=AppDataSource.getRepository(Favorite)
    await repo.delete({
        user:{id:req.user.id},
        property:{id:propertyId}
    })
    res.status(200).json({message:"Removed from favorite"})
}

export const getFavorites = async (req: AuthRequest, res: Response) => {
    try {
        const favoriteRepo = AppDataSource.getRepository(Favorite)
        const favorites = await favoriteRepo.find({
            where: { user: { id: req.user.id } },
            relations: ['property']
        })
        res.status(200).json(favorites)
    } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred'
        res.status(500).json({ message })
    }
}

export const resetFavorites = async (req: AuthRequest, res: Response) => {
    try {
        const favoriteRepo = AppDataSource.getRepository(Favorite)
        await favoriteRepo.delete({ user: { id: req.user.id } })
        res.status(200).json({ message: "Favorites reset" })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred'
        res.status(500).json({ message })
    }
}