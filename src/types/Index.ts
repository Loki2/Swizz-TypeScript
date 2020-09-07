import { Request, Response } from 'express';
export enum RoleOptions {
  client = 'CLIENT', 
  manager = 'ITEMEDITOR', 
  admin = 'ADMIN',
  superUser = 'SUPERADMIN'
}

export interface AppRequest extends Request {
  userId?: string
  tokenVersion?: number 
}



export interface AppContext {
  req: AppRequest; 
  res: Response
}