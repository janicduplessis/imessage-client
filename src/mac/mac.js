import prompt from 'prompt';
import io from 'socket.io-client';
import fetch from 'node-fetch';
import imessagemodule from 'imessagemodule';
import sqlite from 'sqlite3';
import glob from 'glob';

const IMESSAGE_DB = process.env.HOME + '/Library/Messages/chat.db';

//const URL_BASE = 'http://imessage.dokku.jdupserver.com';
const URL_BASE = 'http://localhost:8000';
const URL_LOGIN = URL_BASE + '/api/login';
const URL_LAST_APPLE_ID = URL_BASE + '/api/lastAppleId';

let db = null;
let socket = null;
let reconnectInterval = null;
let latestMessageId = null;
let token = null;

process.on('exit', () => {
  if(db) {
    db.close();
  }
});

let schema = {
  properties: {
    username: {
    },
    password: {
      hidden: true,
    },
  },
};

loginPrompt();

function loginPrompt() {
  prompt.get(schema, (err, result) => {
    if(err) {
      console.error(err);
      return;
    }

    login(result.username, result.password);
  });
}

async function send(method, url, params) {
  let body = null;
  if(params) {
    body = JSON.stringify(params);
  }
  let headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  if(token) {
    headers['Authorization'] = 'Bearer ' + token;
  }

  return await fetch(url, {
    method: method,
    body: body,
    headers: headers,
  })
  .then(resp => resp.json())
  .catch((err) => {
    console.error('send error', err);
  });
}

async function login(username, password) {
  let resp = await send('POST', URL_LOGIN, {
    username: username,
    password: password,
  });
  if(resp.result !== 'OK') {
    console.log('Invalid username or password. Please try again.');
    loginPrompt();
    return;
  }

  token = resp.token;

  latestMessageId = await getLastSentMessageId();
  console.log(latestMessageId);

  createSocket();
}

function createSocket() {
  try {
    socket = io.connect(URL_BASE);
  } catch(error) {
    console.error(error);
  }
  socket.on('authenticated', () => {
    socket.emit('ready', {
      type: 'mac',
    });
  });

  socket.on('message', sendMessage);

  socket.on('connect', () => {
    clearInterval(reconnectInterval);
    connect();
  });

  socket.on('disconnect', () => {
    console.log('Disconnected. Trying to reconnect...');
    tryReconnect();
  });
}

function tryReconnect() {
  reconnectInterval = setInterval(() => {
    socket.connect();
  }, 5000);
}

function connect() {
  socket.connect();

  socket.emit('authenticate', {token});

  console.log('Connected');

  db = new sqlite.Database(IMESSAGE_DB);

  checkNewMessages();
}

function receiveMessages(messages) {
  console.log(`Received ${messages.length} new messages`);
  socket.emit('send', {
    type: 'mac',
    messages: messages,
  });
}

function sendMessage(message) {
  console.log('Sending message:', message);
  imessagemodule.sendMessage(message.convoName, message.text);
}

async function checkNewMessages() {

  if(!latestMessageId) {
    try {
      latestMessageId = await getLastSentMessageId();
    } catch(err) {
      console.error(err);
      return;
    }
  }

  clearInterval(checkNewMessages.interval);
  checkNewMessages.interval = setInterval(async () => {
    let newMessages;
    try {
      newMessages = await getNewMessages(latestMessageId);
    } catch(err) {
      console.error(err);
      return;
    }
    if(newMessages.length > 0) {
      latestMessageId = newMessages[0].ROWID;
      let messages = [];
      for(let m of newMessages) {
        let isFromMe = m.is_from_me === 1;
        let author;
        if(isFromMe) {
          author = 'me';
        } else {
          try {
            author = await getNameFromPhone(m.id);
          } catch(err) {
            console.error(err);
          }
        }
        let date = getDateFromTimestamp(m.date);
        messages.push({
          appleId: m.ROWID,
          author: author,
          date: date,
          text: m.text,
          convoName: m.display_name || author,
          fromMe: isFromMe,
        });
      }

      receiveMessages(messages);
    }
  }, 1000);
}

function getNewMessages(lastMessageId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT DISTINCT
        message.ROWID,
        handle.id,
        message.text,
        message.is_from_me,
        message.date,
        message.date_delivered,
        message.date_read,
        chat.chat_identifier,
        chat.display_name
      FROM message
      LEFT OUTER JOIN chat ON chat.room_name = message.cache_roomnames
      LEFT OUTER JOIN handle ON handle.ROWID = message.handle_id
      WHERE message.service = 'iMessage'
        AND message.ROWID > (?)
      ORDER BY message.date DESC`
        + (lastMessageId === 0 ? `
      LIMIT 500
      ` : '');

    db.serialize(function() {
      db.all(sql, lastMessageId, (err, messages) => {
          if(err) {
            reject(err);
            return;
          }
          resolve(messages);
      });
    });
  });
}

async function getLastSentMessageId() {
  let resp = await send('GET', URL_LAST_APPLE_ID);
  if(resp.error) {
    throw Error(resp.error);
  }
  return resp.id;
}

function getLatestMessageId() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT MAX(message.ROWID) AS maxid
      FROM message`;

    db.serialize(function() {
      db.all(sql, function(err, rows) {
        if(err) {
          reject(err);
          return;
        }
        resolve(rows[0].maxid);
      });
    });
  });
}

const phoneNumberNames = {};

function getNameFromPhone(phoneNumber) {
  return new Promise((resolve, reject) => {
    // Cache
    if(phoneNumberNames[phoneNumber]) {
      resolve(phoneNumberNames[phoneNumber]);
      return;
    }

    if(phoneNumber.indexOf('@') >= 0) {
      phoneNumberNames[phoneNumber] = phoneNumber;
      resolve(phoneNumber);
      return;
    }

    let phone = phoneNumber.replace(/\(/g, '').replace(/\)/g, '').replace(/\-/g, '').replace(/\ /g, '').replace(/\+/g, '');
    // need to make a like statement so we can get the following phone, which is now in the format
    // 11231231234 into 123%123%1234
    // NOTE: this will probably not work for other countries since I assume they store their address differently?
    // fall back to phone number for that case for now

    // Remove the country code if there is one.
    if(phone.length > 10) {
      phone = phone.substr(1);
    }
    // %123
    phone = '%' + phone.substr(0, 3) + '%' + phone.substr(3);
    // %123%123
    phone = phone.substr(0, 8) + '%' + phone.substr(8);
    // %123%123%1234
    console.log(phone);

    glob(process.env.HOME + '/Library/Application\ Support/AddressBook/**/AddressBook-v22.abcddb', async (err, files) => {
      if(err) {
        reject();
        return;
      }
      for(let file of files) {
        const db = new sqlite.Database(file);
        let name;
        try {
          name = await getNameFromDB(db, phone);
          console.log(name);
        } catch(err) {
          console.error(err);
          reject();
          return;
        } finally {
          db.close();
        }

        if(name) {
          phoneNumberNames[phoneNumber] = name;
          resolve(name);
          return;
        }
      }

      phoneNumberNames[phoneNumber] = phoneNumber;
      resolve(phoneNumber);
    });
  });
}

function getNameFromDB(db, phone) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      const sql = `
        SELECT *
        FROM ZABCDCONTACTINDEX
        LEFT OUTER JOIN ZABCDPHONENUMBER ON ZABCDCONTACTINDEX.ZCONTACT = ZABCDPHONENUMBER.ZOWNER
        LEFT OUTER JOIN ZABCDEMAILADDRESS ON ZABCDEMAILADDRESS.ZOWNER = ZABCDCONTACTINDEX.ZCONTACT
        LEFT OUTER JOIN ZABCDMESSAGINGADDRESS ON ZABCDMESSAGINGADDRESS.ZOWNER = ZABCDCONTACTINDEX.ZCONTACT
        LEFT OUTER JOIN ZABCDRECORD ON ZABCDRECORD.Z_PK = ZABCDCONTACTINDEX.ZCONTACT
        WHERE ZFULLNUMBER LIKE (?)`;
      db.all(sql, phone, (err, rows) => {
        if(err) {
          reject();
          return;
        }
        let name = null;
        if (rows.length > 0) {
          name = rows[0].ZFIRSTNAME + ' ' + ((rows[0].ZLASTNAME) ? rows[0].ZLASTNAME : '');
        }
        resolve(name);
      });
    });
  });
}

function getDateFromTimestamp(timestamp) {
  // Dates are stored in sqlite as a timestamp in seconds since Jan 1st 2001.
  // 978307200000 = JS timestamp for that date.
  return new Date((timestamp * 1000) + 978307200000);
}

