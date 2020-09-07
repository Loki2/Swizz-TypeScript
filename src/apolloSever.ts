import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';

import {AuthResolver} from './resolvers/AuthResolver';
import { verifyUserToken } from './utils/TokenHandler';
import { AppContext } from './types/Index';

export default async () => {
  const schema = await buildSchema({
    resolvers: [AuthResolver],
    emitSchemaFile: { path: './src/schema.graphql' },
    validate: false

  })
  return new ApolloServer({ schema, context: ({ req, res}: AppContext) => {
    // console.log('Cokkie -->', req.cookies)
    const userToken = req.cookies[process.env.COOKIE_NAME!]
    // console.log('UserToken-->', userToken)
    if(userToken){
      try {
         //Verify User Token
        const decodedToken = verifyUserToken(userToken) as { 
          userId: string
          tokenVersion: number
          iat: number
          exp: number 
        } | null
      
        // console.log('Decoded Token -->', decodedToken)
        if(decodedToken) {
            req.userId = decodedToken.userId
            req.tokenVersion = decodedToken.tokenVersion
        }
      } catch (error) {
        req.userId = undefined
        req.tokenVersion = undefined
      }
    }
    return { req, res }
  } })
}