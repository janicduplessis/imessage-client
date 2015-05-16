import express from 'express';
import bodyParser from 'body-parser';

const app = express();

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

app.post('/api/login', (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  if(username === 'janic' && password === 'ass') {
    res.json({
      result: 'OK',
      user: {firstName: 'ass', lastName: 'yolo'},
    });
  } else {
    res.json({
      result: 'INVALID_USER_PASS',
      error: 'Invalid username or password.',
    });
  }
});

let server = app.listen(process.env.PORT || 8000, () => {
  let host = server.address().address;
  let port = server.address().port;

  console.info(`==> ✅  Server is listening\n==> 🌎  Go to http://${host}:${port}`);
});
