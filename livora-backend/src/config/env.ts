import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 2727,
  jwt_key: process.env.JWT_SECRET

};
