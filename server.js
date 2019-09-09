const express = require('express');

// const db = require('./data/dbConfig.js');
const AccountRouter = require('./accounts/accountRouter');
const server = express();

server.use(express.json());

server.use('/api/accounts', AccountRouter);

server.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is good to go!' });
});

module.exports = server;
