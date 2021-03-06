import {config} from 'dotenv';
import express from 'express';
import ApolloServer from './apolloSever';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser'

config()
const {
  PORT,
  // DB_USER,
  // DB_PASSWORD,
  // DB_ENDPOINT,
  // DB_NAME,
  DB_URI
} = process.env

const Server = async () => {
  try {
    //Connect To Database
    //`mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_ENDPOINT}/${DB_NAME}?retryWrites=true&w=majority`
    await mongoose.connect( `${DB_URI}`, 
      {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
      }
    )
    //MiddleWare
    const app = express();
    app.use(cookieParser())
    const server = await ApolloServer()

    server.applyMiddleware({app})

    app.listen({ port: PORT}, () => console.log(`Server Start at http://localhost:${PORT}${server.graphqlPath}`))
  } catch (error) {
    console.log(error)
  }
}

Server();