const express = require('express');
const helmet = require('helmet');
const knex = require('knex');
const knexConfig = require('./knexfile').development;

const db = knex(knexConfig);
const bcrypt = require('bcryptjs');
const server = express();

server.use(helmet());
server.use(express.json());

server.get('/', (req, res) => {
  res.send('I\'m ready to party!');
});

server.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  let user = req.body;
  let hashedPw = bcrypt.hashSync(user.password, 12);
  user.password = hashedPw;
  if (!username || !password) {
    res.status(400).json({ errorMessage: 'Missing username or password.' })
  } else {
    db('users').insert(user)
        .then(arrayOfIds => {
          return db('users').where({id: arrayOfIds[0]})
        })
        .then(arrayOfUsers => {
          res.status(201).json(arrayOfUsers[0])
        })
        .catch(error=> {
          res.status(500).json({ errorMessage: 'The user could not be created.' });
        })
  }
});


const port = 4000;
server.listen(port, () => console.log(`Listening on http://localhost:${port}!`));
