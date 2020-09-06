import { Resolver, Query, Mutation, Arg, Ctx } from 'type-graphql';
import {User, UserModel} from '../entities/User';
import { validateUsername, validateEmail, validatePassword } from '../utils/Validate';
import bcrypt from 'bcryptjs';

import { createToken, sendToken } from '../utils/TokenHandler';
import { Appcontext } from '../types/Index';


@Resolver()
export class AuthResolver {
  //Query User From Database
  @Query(() => [User], { nullable: 'items'}) //Return Value [User!]!
    async users(): Promise<User[] | null> {
    try {
      return UserModel.find()
    } catch (error) {
      throw error
    }
  }

  //Mutation Create User To Database
  @Mutation(() => User)
    async singUp( 
        @Arg('username') username: string, 
        @Arg('email') email: string, 
        @Arg('password') password: string,
        @Ctx() {res}: Appcontext
      ) {
      try {
        //Validate Username
        if(!username) throw new Error('Username is required...!')
        const isUsernameValid = validateUsername(username)
        if(!isUsernameValid) throw new Error('Username must be between 3 - 60 characters...')

        //Validate Email
        if(!email) throw new Error('Email is Required...!')
        const isEmailValid = validateEmail(email)
        if(!isEmailValid) throw new Error('Email is invalid...!')


        //Validate Password
        if(!password) throw new Error('Password is required...!')
        const isPasswordValid = validatePassword(password)
        if(!isPasswordValid) throw new Error('Password must be 6 - 60 Charecters...!')

        const hashPassword = await bcrypt.hash(password, 10)


        const newUser = await UserModel.create<Pick<User, 'username' | 'email' | 'password'>>({
          username,
          email,
          password: hashPassword
        })
        console.log(newUser)
        await newUser.save()
        
        //Create Key Token
        const token = createToken(newUser.id, newUser.tokenVersion)
        console.log(token)
        //Send Key Token to Client
        sendToken(res, token)
        return newUser
        
      } catch (error) {
        throw error
      }
    }
}  