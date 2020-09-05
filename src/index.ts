import express from 'express';
import ApolloServer from './apolloSever';


const Server = () => {
  const app = express();
  const server = ApolloServer()

  server.applyMiddleware({app})

  app.listen({ port: 5000}, () => console.log(`Server Start at http://localhost:5000${server.graphqlPath}`))
}

Server();