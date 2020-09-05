import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';

import {AuthResolver} from './resolvers/AuthResolver';

export default async () => {
  const schema = await buildSchema({
    resolvers: [AuthResolver],
    emitSchemaFile: {path: './src/schema.graphql'},
    validate: false

  })
  return new ApolloServer({ schema })
}