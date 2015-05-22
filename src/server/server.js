import express from 'express.io';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import nconf from 'nconf';
import db from 'rethinkdb';

import UserStore from './UserStore';
import MessageStore from './MessageStore';

nconf.argv()
  .env()
  .file({file: 'config/server.json'});

const config = {
  database: {
    host: nconf.get('db:host'),
    port: nconf.get('db:port'),
    authKey: nconf.get('db:authKey'),
  },
  server: {
    port: nconf.get('server:port'),
  },
};

console.info('Starting iMessage server...\n');
console.info('Config:');
console.info('db:', nconf.get('db'));
console.info('server:', nconf.get('server'), '\n');

const app = express();
app.http().io();

let userStore = null;
let messageStore = null;

app.use(morgan('dev'));
app.use('/', express.static('static'));
app.use(bodyParser.json());

/**
 * Index handler.
 */
app.get('/', (req, res) => {
  const webserver = process.env.NODE_ENV === 'production' ? '' : '//localhost:8080';
  let output = (
    `<!doctype html>
    <html lang="en-us">
      <head>
        <meta charset="utf-8">
        <title>iMessage web client</title>
      </head>
      <body>
        <div id="content"></div>
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
  let { username, password } = req.body;

  let {user, error} = await userStore.login(username, password);
  if(error) {
    res.json({
      result: 'INVALID_USER_PASS',
      error: 'Invalid username or password.',
    });
    return;
  }

  res.json({
    result: 'OK',
    user: user,
    token: 'awdawdwad',
  });
});

/**
 * Register handler.
 */
app.post('/api/register', (req, res) => {
  let {
    username,
    password,
    firstName,
    lastName,
  } = req.body;

  let {user, error} = userStore.register(username, password, firstName, lastName);

  if(error) {
    res.json({
      result: 'ERROR',
      error: error,
    });
    return;
  }

  res.json({
    result: 'OK',
    user: user,
    token: 'awdawdwad',
  });
});

app.io.route('send', (req) => {
  if(req.type === 'client') {
    // If we receive a new message from the web client we send it
    // to the mac client.
    req.io.room(req.user.id + '-mac').broadcast('message', req.message);
  } else {
    // If we receive a new message from the mac client we save it to
    // the database. When the database receives new messages it will
    // notify the web clients via a change handler.
    messageStore.add(req.user.id, req.message);
  }
});

app.io.route('ready', (req) => {
  if(req.type === 'client') {
    // Add a web client to the user group.
    req.io.join(req.user.id + '-client');

    // When the message store receives a new message notify the web clients for
    // that user.
    messageStore.addMessageListener(req.user.id, (message) => {
      console.log('New message for user:', req.user.id, message);
      req.io.room(req.user.id + '-client').broadcast('message', message);
    });
  } else {
    // Add a mac client to the user group.
    req.io.join(req.user.id + '-mac');
  }
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

  // Create stores.
  userStore = new UserStore(conn);
  messageStore = new MessageStore(conn);

  try {
    await messageStore.init();
  } catch(err) {
    console.log('Error initializing the message store.', err);
    return;
  }

  messageStore.addMessageListener('90d0fd03-a617-4ee8-8385-10174d6d0c87', (message) => {
    console.log(message);
  });

  let messages = await messageStore.list('90d0fd03-a617-4ee8-8385-10174d6d0c87');
  console.log(messages);

  // Start the server.
  console.info(`Starting server on port ${config.server.port}...`);
  app.listen(config.server.port, () => {
    console.info('Server started.');
  });
})();
