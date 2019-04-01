const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const knex = require('knex');
const knexConfig = require('./knexfile').development;

const db = knex(knexConfig);


const session = require('express-session');
const server = express();

const sessionConfig = {
  name: 'monkey',
  secret: 'keep it secret, keep it safe!',
  cookie: {
    maxAge: 1000 * 60 * 15,
    secure: false,
  },
  httpOnly: true, // user can't access the cookie from js using document.cookie
  resave: false,
  saveUninitialized: false, // GDPR laws against setting cookies automatically
};

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig));

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

server.get('/api/users', (req, res) => {
  db('users')
    .then(users => {
      res.status(200).json(users)
    })
    .catch((error) => {
      res.status(500).json({ errorMessage: 'The users could not be retrieved.' })
    });
});

server.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = req.body;
  if (!username || !password) {
    res.status(400).json({ errorMessage: 'Missing username or password.' });
  } else {
    db('users')
      .where({ username: user.username})
      .first()
      .then((user) =>{
        if( user && bcrypt.compareSync(password, user.password)) {
          req.session.user = user;
          res.status(200).json({message: `Welcome ${user.username}!`});
        } else {
          res.status(401).json({ message: 'You shall not pass!'});
        }
      })
      .catch(error => {
        res.status(500).json({ errorMessage: 'Login unsuccessful' })
      });
  }
});

const port = 4000;
server.listen(port, () => console.log(`Listening on http://localhost:${port}!`));
