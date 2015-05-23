import prompt from 'prompt';
import io from 'socket.io-client';
import fetch from 'node-fetch';
import imessagemodule from 'imessagemodule';
import sqlite from 'sqlite3';

const URL_BASE = 'http://localhost:8000';
const URL_LOGIN = URL_BASE + '/api/login';

prompt.get(['username', 'password'], (err, result) => {
  if(err) {
    console.error(err);
    return;
  }
  login(result.username, result.password);
});

function login(username, password) {
  fetch(URL_LOGIN, {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: username,
      password: password,
    }),
  })
  .then((resp) => resp.json())
  .then((resp) => {
    connect(resp.token);
  })
  .catch((err) => {
    console.error(err);
  });
}

function connect(token) {
  const socket = io.connect(URL_BASE);
  socket.on('authenticated', () => {
    socket.emit('ready', {
      type: 'mac',
    });
  });

  socket.on('message', sendMessage);

  socket.emit('authenticate', {token: token});

  function receiveMessage(message) {
    socket.emit('send', {
      type: 'mac',
      message: message,
    });
  }
}

function sendMessage(message) {
  console.log(message);
  imessagemodule.sendMessage('Janic Duplessis', message.message);
}

