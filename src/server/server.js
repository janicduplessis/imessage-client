import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import nconf from 'nconf';
import db from 'rethinkdb';

import UserStore from './UserStore';

nconf.argv()
  .env()
  .file({file: 'config/server.json'});

const config = {
  database: {
    host: nconf.get('db:host'),
    port: nconf.get('db:port'),
    authKey: nconf.get('db:authKey'),
  },
};

const app = express();
let userStore = null;

app.use(morgan('dev'));
app.use('/', express.static('static'));
app.use(bodyParser.json());

/**
 * Index
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

function startServer() {
  let server = app.listen(process.env.PORT || 8000, () => {
    let host = server.address().address;
    let port = server.address().port;

    console.info(`==> ✅  Server is listening\n==> 🌎  Go to http://${host}:${port}`);
  });
}

db.connect({
  host: config.database.host,
  port: config.database.port,
  db: 'imessagechat',
  /*authKey: config.database.authKey,*/
}).then((conn) => {
  userStore = new UserStore(conn);
  startServer();
}).catch((err) => {
  console.error(err);
});
