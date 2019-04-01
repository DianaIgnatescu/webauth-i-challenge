const express = require('express');
const helmet = require('helmet');
const knex = require('knex');
const knexConfig = require('./knexfile').development;

const db = knex(knexConfig);
const server = express();

server.use(helmet());
server.use(express.json());

server.get('/', (req, res) => {
  res.send('I\'m ready to party!');
});


const port = 4000;
server.listen(port, () => console.log(`Listening on http://localhost:${port}!`));
