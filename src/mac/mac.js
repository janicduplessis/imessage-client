import prompt from 'prompt';
import io from 'socket.io-client';
import fetch from 'node-fetch';
import imessagemodule from 'imessagemodule';
import sqlite from 'sqlite3';
import glob from 'glob';

const IMESSAGE_DB = process.env.HOME + '/Library/Messages/chat.db';

const URL_BASE = 'http://localhost:8000';
const URL_LOGIN = URL_BASE + '/api/login';

let db = null;
let socket = null;

process.on('exit', () => {
  if(db) {
    db.close();
  }
});

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
  socket = io.connect(URL_BASE);
  socket.on('authenticated', () => {
    socket.emit('ready', {
      type: 'mac',
    });
  });

  socket.on('message', sendMessage);

  socket.emit('authenticate', {token: token});

  db = new sqlite.Database(IMESSAGE_DB);

  checkNewMessages();
}

function receiveMessage(message) {
  socket.emit('send', {
    type: 'mac',
    message: message,
  });
}

function sendMessage(message) {
  console.log(message);
  imessagemodule.sendMessage(message.convo, message.text);
}

async function checkNewMessages() {
  let latestMessageId;
  try {
    latestMessageId = await getLatestMessageId();
  } catch(err) {
    console.error(err);
    return;
  }
  setInterval(async () => {
    let newMessages;
    try {
      newMessages = await getNewMessages(latestMessageId);
    } catch(err) {
      console.error(err);
      return;
    }
    if(newMessages.length > 0) {
      latestMessageId = newMessages[newMessages.length - 1].ROWID;
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

        const message = {
          author: author,
          text: m.text,
          convo: m.display_name || m.id,
          fromMe: isFromMe,
        };
        console.info(message);
        receiveMessage(message);
      }
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
      ORDER BY message.date DESC`;

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

