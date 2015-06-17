import {Server} from 'http';
import express from 'express';
import io from 'socket.io';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import nconf from 'nconf';
import db from 'rethinkdb';
import jwt from 'jsonwebtoken';
import expressJwt from 'express-jwt';
import socketJwt from 'socketio-jwt';

import UserStore from './UserStore';
import MessageStore from './MessageStore';

nconf.argv()
  .env('__')
  .file('user', 'config/server.user.json')
  .file('default', 'config/server.default.json');

const config = {
  database: {
    host: nconf.get('db:host'),
    port: nconf.get('db:port'),
    authKey: nconf.get('db:authKey'),
  },
  server: {
    port: nconf.get('server:port'),
    jwtSecret: nconf.get('server:jwtSecret'),
  },
};

const publicPaths = ['/', '/api/login', '/api/register'];

console.info('Starting iMessage server...\n');
console.info('Config:');
console.info('db:', config.database);
console.info('server:', config.server, '\n');

const app = express();
const server = new Server(app);
app.io = io(server);

let userStore = null;
let messageStore = null;

app.use(morgan('dev'));
app.use('/', express.static('static'));
app.use(bodyParser.json());
app.use(expressJwt({secret: config.server.jwtSecret}).unless({path: publicPaths}));

/**
 * Websocket handlers.
 */
app.io.sockets.on('connection', socketJwt.authorize({
  secret: config.server.jwtSecret,
  timeout: 10000,
})).on('authenticated', (socket) => {
  const user = socket.decoded_token;
  console.log('Authenticated', user.username);

  let messageListener = (message) => {
    console.log('Sending message to web client', user.username, message);
    socket.emit('message', message);
  };

  socket.on('send', (data) => {
    if(data.type === 'client') {
      console.log('Message from web client', user.username, data.message);
      // If we receive a new message from the web client we send it
      // to the mac client.
      socket.to(user.id + '-mac').emit('message', data.message);
    } else {
      // If we receive a new message from the mac client we save it to
      // the database. When the database receives new messages it will
      // notify the web clients via a change handler.
      console.log('Message from mac client', user.username, data.messages);
      // TODO: insert all the messages at the same time.
      for(let m of data.messages) {
        messageStore.add(user.id, m);
      }
    }
  });

  socket.on('ready', (data) => {
    if(data.type === 'client') {
      console.log('Web client connected', user.username);
      // Add a web client to the user group.
      socket.join(user.id + '-client');

      // When the message store receives a new message notify the web clients for
      // that user.
      messageStore.addMessageListener(user.id, messageListener);
    } else {
      console.log('Mac client connected', user.username);
      // Add a mac client to the user group.
      socket.join(user.id + '-mac');
    }
    console.log('test');
  });

  socket.on('disconnect', () => {
    console.info('Disconnected', user.username);
    socket.leave(user.id + '-client');
    socket.leave(user.id + '-mac');
    messageStore.removeMessageListener(user.id, messageListener);
  });
});

/**
 * Index handler.
 */
app.get('/', (req, res) => {
  const webserver = process.env.NODE_ENV === 'production' ? '' : '//localhost:8081';
  // TODO: Serve fonts and icons locally
  let output = (
    `<!doctype html>
    <html lang="en-us">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
        <title>iMessage web client</title>
        <link href='http://fonts.googleapis.com/css?family=Roboto:400,300,500' rel='stylesheet' type='text/css'>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
      </head>
      <body>
        <div id="content"></div>
        <script src="/socket.io/socket.io.js"></script>
        <script src="${webserver}/dist/client.js"></script>
      </body>
    </html>`
  );

  res.send(output);
});

/**
 * Login handler.
 */
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  const {user, error} = await userStore.login(username, password);
  if(error) {
    res.json({
      result: 'INVALID_USER_PASS',
      error: 'Invalid username or password.',
    });
    return;
  }

  const token = jwt.sign(user, config.server.jwtSecret);

  res.json({
    result: 'OK',
    user: {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    token: token,
  });
});

/**
 * Register handler.
 */
app.post('/api/register', async (req, res) => {
  const {
    username,
    password,
    firstName,
    lastName,
  } = req.body;

  const {user, error} = await userStore.register(username, password, firstName, lastName);

  if(error) {
    res.json({
      result: 'ERROR',
      error: error,
    });
    return;
  }

  const token = jwt.sign(user, config.server.jwtSecret);

  res.json({
    result: 'OK',
    user: {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    token: token,
  });
});

app.get('/api/messages/:convoId', async (req, res) => {
  const messages = await messageStore.listMessages(req.user.id, req.params.convoId);
  res.json(messages);
});

app.get('/api/convos', async (req, res) => {
  const convos = await messageStore.listConvos(req.user.id);
  res.json(convos);
});

(async () => {
  // Init database.
  console.info(`Connecting to database at ${config.database.host}:${config.database.port}...`);
  let conn;
  try {
    conn = await db.connect({
      host: config.database.host,
      port: config.database.port,
      db: 'imessagechat',
      /*authKey: config.database.authKey,*/
    });
  } catch(error) {
    console.error(`Error connecting to database.\n${error}`);
    return;
  }
  console.info('Connected to database');

  // Create the database and tables if necessary.
  console.info('Creating database and tables...');
  try {
    await db.dbCreate('imessagechat').run(conn);
    console.info('Created database imessagechat.');
  } catch(error) {
    console.info('Database imessagechat already exists.');
  }
  try {
    await db.tableCreate('users').run(conn);
    console.info('Created table users.');
  } catch(error) {
    console.info('Table users already exists.');
  }
  try {
    await db.tableCreate('messages').run(conn);
    console.info('Created table messages.');
  } catch(error) {
    console.info('Table messages already exists.');
  }
  try {
    await db.table('messages').indexCreate('date').run(conn);
    console.info('Created messages index on date');
  } catch(error) {
    console.info('Table messages date index already exists');
  }
  try {
    await db.tableCreate('convos').run(conn);
    console.info('Created table convos.');
  } catch(error) {
    console.info('Table convos already exists.');
  }

  // Create stores.
  userStore = new UserStore(conn);
  messageStore = new MessageStore(conn);

  try {
    await messageStore.init();
  } catch(err) {
    console.log('Error initializing the message store.', err);
    return;
  }

  // Start the server.
  console.info(`Starting server on port ${config.server.port}...`);
  server.listen(config.server.port, () => {
    console.info('Server started.');
  });
})();
