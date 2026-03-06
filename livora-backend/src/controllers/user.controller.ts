import { Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { User } from "../entities/User";

export const getProfile = async (req: any, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(User)
        const user = await repo.findOneBy({ id: req.user.id })

        res.status(200).json({
            email:user?.email,
            fullName:user?.fullName,
            phone:user?.phone,
            role:user?.role
        })
    } catch (err) {
        const message = err instanceof Error ? err.message : "Internal server error"
        return res.status(500).json(message)
    }
}

export const getAllUsers = async (_req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(User)
        const users = await repo.find({
            select: {
                fullName: true,
                email: true,
                phone: true,
                role: true,
            }
        })
        res.json(users)
    } catch (err) {
        const message = err instanceof Error ? err.message : "Internal server error"
        return res.status(500).json(message)
    }
}

export const deleteUser = async (req: Request, res: Response) => {

    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid userId" })
        }
        const repo = AppDataSource.getRepository(User)
        await repo.delete(id)
        res.status(200).json({ message: "User successuflly deleted" })
    } catch (err) {
        const message = err instanceof Error ? err.message : "Internal server error"
        return res.status(500).json(message)
    }
}

export const deleteMe = async (req: any, res: Response) => {

    try {
        const id = Number(req.user?.id)
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid userId" })
        }

        const repo = AppDataSource.getRepository(User)
        await repo.delete(id)
        res.status(200).json({ message: "Account successuflly deleted" })
    } catch (err) {
        const message = err instanceof Error ? err.message : "Internal server error"
        return res.status(500).json(message)
    }
}