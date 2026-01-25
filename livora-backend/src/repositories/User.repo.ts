import { AppDataSource } from '../config/db';
import { User } from '../entities/User';

export const userRepo = AppDataSource.getRepository(User);