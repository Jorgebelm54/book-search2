const express = require('express');
const { ApolloServer } = require("apollo-server-express");
const path = require('path');
const db = require('./config/connection');
const { authMiddleware } = require("./utils/auth");
const { typeDefs, resolvers } = require("./schemas");

const app = express();
const PORT = process.env.PORT || 3001;


const startServer = async () => {
  // create a new Apollo server and pass in our schema data
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware
  });

  // start the Apollo server
  await server.start();

  // integrate our Apollo server with the express app as middleware
  server.applyMiddleware({ app });

  // log where we can go test our GQL API
  console.log(
    `Server is running on http://localhost:3001`
  );
};

//Initialize the Apollo server
startServer();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`)
  );
});
