import { Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { User } from "../entities/User";
import { RefreshToken } from "../entities/RefreshToken";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { config } from "../config/env";

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const toPublicUser = (user: User) => ({
  id: user.id,
  fullName: user.fullName,
  phone: user.phone,
  role: user.role,
  createdAt: user.createdAt
});

const issueTokens = async (user: User) => {
  const secret = config.jwt_key;

  if (!secret) {
    throw new Error("JWT secret is not configured");
  }

  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    secret,
    { expiresIn: "15m" }
  );

  const refreshTokenValue = crypto.randomBytes(48).toString("hex");
  const refreshRepo = AppDataSource.getRepository(RefreshToken);

  const refreshTokenEntity = refreshRepo.create({
    token: refreshTokenValue,
    user,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS)
  });

  await refreshRepo.save(refreshTokenEntity);

  return { accessToken, refreshToken: refreshTokenValue };
};

export const register = async (req: Request, res: Response) => {
  const { fullName, email, phone, password, role } = req.body;

  try {
    const userRepo = AppDataSource.getRepository(User);
    const existing = await userRepo.findOne({ where: { email } });

    if (existing) {
      return res.status(409).json({
        message: "Account with email already exists"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = userRepo.create({ fullName, email, phone, passwordHash, role });
    await userRepo.save(user);

    const tokens = await issueTokens(user);

    res.status(201).json({
      user: toPublicUser(user),
      ...tokens
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const tokens = await issueTokens(user);

    res.json({
      user: toPublicUser(user),
      ...tokens
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token required" });
  }

  const repo = AppDataSource.getRepository(RefreshToken);
  const existing = await repo.findOne({ where: { token: refreshToken } });

  if (!existing) {
    return res.status(404).json({ message: "Refresh token not found" });
  }

  await repo.remove(existing);

  return res.status(200).json({
    message: "Logged out successfully"
  });
};