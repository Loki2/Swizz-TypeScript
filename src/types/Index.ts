import { Request, Response } from 'express';
export enum RoleOptions {
  client = 'CLIENT', 
  manager = 'ITEMEDITOR', 
  admin = 'ADMIN',
  superUser = 'SUPERADMIN'
}

export interface Appcontext {
  req: Request; 
  res: Response
}