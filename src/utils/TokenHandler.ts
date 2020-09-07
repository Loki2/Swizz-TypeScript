import jwt from 'jsonwebtoken';
import { Response } from 'express';

export const createToken = (userId: String, tokenVersion: Number) => jwt.sign({userId, tokenVersion}, process.env.APP_SECRET!, {expiresIn: '1d'})

export const sendToken = (res: Response, token: string) => res.cookie(process.env.COOKIE_NAME!, token, {httpOnly: true}) 

export const verifyUserToken = (token: string) => jwt.verify(token, process.env.APP_SECRET!)