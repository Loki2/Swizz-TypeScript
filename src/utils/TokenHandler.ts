import jwt from 'jsonwebtoken';
import { Response } from 'express';

export const createToken = (userId: String, tokenVersion: Number) => jwt.sign({userId, tokenVersion}, 'Aabliboleter', {expiresIn: '1d'})

export const sendToken = (res: Response, token: string) => res.cookie('jwt', token, {httpOnly: true}) 