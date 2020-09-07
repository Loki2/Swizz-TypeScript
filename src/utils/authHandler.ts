import { UserModel } from '../entities/User';

export const isAuthenticated = async (userId: string, tokenVersion?: number) => {
    //Query user from database
    const user = await UserModel.findById(userId)
    if(!user) throw new Error('User not Authenticated...!')

    //Check if Toekn version Valid
    if(tokenVersion !== user.tokenVersion) throw new Error('Not Authenticated')

    return user

}