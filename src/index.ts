import {config} from 'dotenv';
import express from 'express';
import ApolloServer from './apolloSever';
import mongoose from 'mongoose';

config()
const {
  PORT,
  DB_USER,
  DB_PASSWORD,
  DB_ENDPOINT,
  DB_NAME
} = process.env

const Server = async () => {
  try {
    //Connect To Database
    await mongoose.connect( `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_ENDPOINT}/${DB_NAME}?retryWrites=true&w=majority`, 
      {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
      }
    )

    const app = express();
    const server = await ApolloServer()

    server.applyMiddleware({app})

    app.listen({ port: PORT}, () => console.log(`Server Start at http://localhost:${PORT}${server.graphqlPath}`))
  } catch (error) {
    console.log(error)
  }
}

Server();