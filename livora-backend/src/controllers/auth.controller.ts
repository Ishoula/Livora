import { Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { User, UserRole } from "../entities/User";

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import { config } from "../config/env";

export const register= async(req: Request, res:Response)=>{
    const {fullName, email,phone,password,role}=req.body;

    try{
        const userRepo=AppDataSource.getRepository(User)
        const existing= await userRepo.findOne({where:{email}})

        if(existing) return res.status(400).json({
            message:"Account with email already exists"
        })

        const passwordHash=await bcrypt.hash(password,10)
        const user=userRepo.create({fullName,email,phone,passwordHash,role})
        await userRepo.save(user)

        const token=jwt.sign(
            {id:user.id, role:user.role},config.jwt_key)
        res.json({user,token})  
    }catch(err: any){
        res.status(500).json({error:err.message})
    }
}

export const login=async(req:Request, res:Response)=>{
    const {email,password}=req.body;
    try{
        const userRepo=AppDataSource.getRepository(User)
        const user= await userRepo.findOne( {where:{email}})
        if(!user) 
            return res.status(404).json({message: "User not found"})
        const match=await bcrypt.compare(password,user.passwordHash)
        if(!match) 
            return res.status(401).json({message:"INvalid password"})

        const token=jwt.sign({id:user.id, role:user.role}, config.jwt_key)
        res.json({user,token})

    }catch(err: any){
        res.status(500).json({error:err.message})
    }
}