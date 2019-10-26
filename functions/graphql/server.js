const express = require('express');
const {ApolloServer} = require('apollo-server-express');

const schema = require('./schema');
const resolvers = require('./resolvers');

function gqlServer() {
  const app = express();

  const apolloServer = new ApolloServer({
    typeDefs: schema,
    resolvers,
    // Enable graphiql gui
    introspection: true,
    playground: true
  });

  apolloServer.applyMiddleware({app, path: '/', cors: true});

  return app;
}

module.exports = gqlServer;