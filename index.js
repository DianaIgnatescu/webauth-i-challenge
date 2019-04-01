const express = require('express');
const knex = require('knex');
const knexConfig = require('./knexfile').development;

const db = knex(knexConfig);
const server = express();
server.use(express.json());



const port = 5000;
server.listen(port, () => console.log(`Listening on http://localhost:${port}!`));
