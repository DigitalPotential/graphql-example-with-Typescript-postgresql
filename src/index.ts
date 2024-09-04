import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import pool from "./db/db.js";
import createResolvers from "./db/queries.js";

import { typeDefs } from "./graphql/schema.js";

const resolvers = createResolvers(pool);

console.log("TypeDefs:", typeDefs);
console.log("Resolvers:", JSON.stringify(resolvers, null, 2));

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at: ${url}`);
});
