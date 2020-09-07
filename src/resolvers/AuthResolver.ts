import { randomBytes } from 'crypto';
import { Resolver, Query, Mutation, Arg, Ctx, ObjectType, Field } from 'type-graphql';
import {User, UserModel} from '../entities/User';
import { validateUsername, validateEmail, validatePassword } from '../utils/Validate';
import bcrypt from 'bcryptjs';
import sgMail, {MailDataRequired} from '@sendgrid/mail';
import { createToken, sendToken } from '../utils/TokenHandler';
import { AppContext } from '../types/Index';
import { isAuthenticated } from '../utils/authHandler';
require('dotenv').config()



// console.log( 'Api Key',apiKey)
//Request to Reset Password Mail sender API Key:
const apiKey = process.env.SENDGRID_API_KEY;
sgMail.setApiKey(apiKey!)

@ObjectType()
export class ResponseMessage {
  @Field()
  message!: string;
}

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
  //Query User's info From Database
  @Query(() => User, { nullable: true}) //Return Value [User!]!
  async myinfo(@Ctx() {req}: AppContext): Promise<User | null> {
  try {
    if(!req.userId) throw new Error('Plz Signin to processed')

    //Check user is Authenticated
    const user = await isAuthenticated(req.userId, req.tokenVersion)

    if(!user) throw new Error('User not Authenticated...!')
    return user
  } catch (error) { 
    throw error
  }
}

  //Mutation Create User To Database
  @Mutation(() => User, {nullable: true})
    async singup( 
        @Arg('username') username: string, 
        @Arg('email') email: string, 
        @Arg('password') password: string,
        @Ctx() {res}: AppContext
      ): Promise<User | null> {
      try {
        //Check if not Username, Email, Password
        if(!username) throw new Error('Username is required...!');
        if(!email) throw new Error('Email is Required...!');
        if(!password) throw new Error('Password is required...!')

        //Check if user already exist
        const user = await UserModel.findOne({email, username})
        if(user) throw new Error('Email Or Username already exist, Plz sign in...!')

        //Validate Username
        const isUsernameValid = validateUsername(username)
        if(!isUsernameValid) throw new Error('Username must be between 3 - 60 characters...')

        //Validate Email        
        const isEmailValid = validateEmail(email)
        if(!isEmailValid) throw new Error('Email is invalid...!')


        //Validate Password        
        const isPasswordValid = validatePassword(password)
        if(!isPasswordValid) throw new Error('Password must be 6 - 60 Charecters...!')

        const hashPassword = await bcrypt.hash(password, 10)
        const newUser = await UserModel.create<Pick<User, 'username' | 'email' | 'password'>>({
          username,
          email,
          password: hashPassword
        })
       
        await newUser.save()
        
        //Create Key Token
        const token = createToken(newUser.id, newUser.tokenVersion)
       
        //Send Key Token to Client
        sendToken(res, token)
        return newUser
        
      } catch (error) {
        throw error
      }
    }


  //Signip User to database
  @Mutation(() => User, {nullable: true})
    async singin( 
        @Arg('email') email: string, 
        @Arg('password') password: string,
        @Ctx() {res}: AppContext
      ): Promise<User | null> {
      try {
        //Check if not Username, Email, Password
        if(!email) throw new Error('Email is Required...!');
        if(!password) throw new Error('Password is required...!')

        //Check if user already exist
        const user = await UserModel.findOne({email})
        if(!user) throw new Error('Email Or Username not found, Plz signup...!')

        //Check Password valid
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) throw new Error('Your email or password is invalid...!')

        //Create Key Token
        const token = createToken(user.id, user.tokenVersion)
       
        //Send Key Token to Client
        sendToken(res, token)
        return user
        
      } catch (error) {
        throw error
      }
    }

    //Signout user from database
    @Mutation(() => ResponseMessage, {nullable: true})
    async singout( 
        @Ctx() {req, res}: AppContext
      ): Promise<ResponseMessage | null> {
      try {
        //Check if user already exist
        const user = await UserModel.findById(req.userId)
        if(!user) return null

        //Bump user Token
        //user.tokenVersion = user.tokenVersion + 1: TODO: Number !== number
        await user.save()

        //cookie Clear From browser
        res.clearCookie(process.env.COOKIE_NAME!)
        return {message: "Signout Complete...!"}
        
      } catch (error) {
        throw error
      }
    }
  

    //Request To Reset Password: TODO1
    @Mutation(() => ResponseMessage, {nullable: true})
    async requestResetPassword( 
       @Arg('email') email: string
    ): Promise<ResponseMessage | null> {
      try {
        //Check required Email
        if(!email) throw new Error('Email is required...!')
        //Check if user already exist
        const user = await UserModel.findOne({email})
        if(!user) throw new Error('Email not found...!')

        const resetPasswordToken = randomBytes(16).toString('hex')
        const resetPasswordTokenExpiry = Date.now() + 1000*60*15;


        //Update user in the database time limitted 15mns
        const updatedUser = await UserModel.findOneAndUpdate(
          {email}, 
          {resetPasswordToken, resetPasswordTokenExpiry}, 
          {new: true}
        )

        if(!updatedUser) throw new Error('Update can not proceed, Plz check try again...!')
        
        const messageSender: MailDataRequired = {
          from: 'admin@me.com', //User real email When production release!
          to: email, //User email who wanted to reset password!
          subject: 'Reset Password for Swizz Authorization...!',
          text: 'and easy to do anywhere, even with Node.js',
          html: `
            <div>
              <p>Please click link below to Reset your Password</p>
              <a href='http://localhost:5000/?resetToken=${resetPasswordToken}' target="blank">Click to Reset Password</a>
            </div>
          `
        }

       const responsemsg = await  sgMail.send(messageSender);

       if(!responsemsg || responsemsg[0]?.statusCode !== 202) throw new Error('Sorry, Can not Proceed...!');

       return { message: 'Plz Check your email, try again...!'}
        
      } catch (error) {
        throw error
      }
    }
  
}  