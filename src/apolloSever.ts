import { ApolloServer, gql } from 'apollo-server-express';


const typeDefs = gql `
  type User {
    id: String!
    username: String!
    email: String!
    password: String!
  }

  type Query {
    users: [User]!
  }

  type Mutation {
    createUser(username: String! email: String! password: String!):User
  }
`
interface inputArgs {
  username: string
  email: string
  password: string
}

const users =  [
  {id: '001', username: 'Loki', email: 'rixnickl2@gmail.com', password: '12345677' }
] 
const resolvers = {
  Query: {
    users: () => users 
  },

  Mutation: {
    createUser:( _: any, args: inputArgs) => {
      const {username, email, password} = args

      const newUser = {
        id: '002',
        username,
        email,
        password
      }

      users.push(newUser)

      return newUser
    }
  }
}
export default () => {
  return new ApolloServer({ typeDefs, resolvers})
}