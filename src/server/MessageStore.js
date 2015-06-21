import db from 'rethinkdb';

/**
 * Message store.
 */
export default class MessageStore {
  constructor(conn) {
    this.conn = conn;
    this.users = new Map();
  }

  /**
   * Initializes the database change handler.
   */
  async init() {
    let c;
    try {
      c = await db.table('messages')
        .changes()
        .getField('new_val')
        .eqJoin('convoId', db.table('convos'))
          .without({'right': {'id': true}})
          .zip()
        .run(this.conn);
    } catch(err) {
      console.error(err);
      return;
    }

    c.each((err, message) => {
      if(err) {
        console.error(err);
        return;
      }

      let userCallbacks = this.users.get(message.userId);
      if(userCallbacks) {
        for(let cb of userCallbacks.values()) {
          cb.call(null, {
            id: message.id,
            convoId: message.convoId,
            convoName: message.name,
            date: message.date,
            author: message.author,
            text: message.text,
            fromMe: message.fromMe,
          });
        }
      }
    });
  }

  /**
   * Add a message to the store.
   *
   * @param {Object} message
   */
  async add(userId, messages) {
    // Group messages by convo.
    let convos = new Map();
    for(let m of messages) {
      if(convos.has(m.convoName)) {
        let c = convos.get(m.convoName);
        c.messages.push(m);
        if(m.date > c.lastMessageDate) {
          c.lastMessageDate = m.date;
        }
      } else {
        convos.set(m.convoName, {
          messages: [m],
          lastMessageDate: m.date,
        });
      }
    }

    // Get ids from the db and create the
    // convo if it doesnt exit yet.
    // TODO: could batch inserts for convos too.
    for(let [convoName, convo] of convos) {
      let c = await db.table('convos')
        .filter(db.row('userId').eq(userId)
          .and(db.row('name').eq(convoName)))
        .run(this.conn);

      let convosArray = await c.toArray();
      if(convosArray.length === 0) {
        let res = await db.table('convos')
          .insert({
            userId: userId,
            name: convoName,
            lastMessageDate: convo.lastMessageDate,
          })
          .run(this.conn);
        convo.id = res.generated_keys[0];
      } else {
        convo.id = convosArray[0].id;
        await db.table('convos')
          .get(convo.id)
          .update({lastMessageDate: convo.lastMessageDate})
          .run(this.conn);
      }
    }

    // Insert messages
    let dbMessages = messages.map((m => {
      return {
        userId: userId,
        convoId: convos.get(m.convoName).id,
        appleId: m.appleId,
        date: m.date,
        author: m.author,
        text: m.text,
        fromMe: m.fromMe,
      };
    }));

    try {
      await db.table('messages')
        .insert(dbMessages)
        .run(this.conn);
    } catch(err) {
      console.error('Failed to create message', err);
      return;
    }
  }

  /**
   * Get messages in a conversation for a user.
   *
   * @param {string} userId User id
   * @param {string} convoId Conversation id
   * @param {number} page Page of messages to load
   * @param {number} pageSize Number of messages per page
   * @return {Array}
   */
  async listMessages(userId, convoId, page = 0, pageSize = 50) {
    let min = page * pageSize;
    let max = min + pageSize;
    let c;
    try {
      c = await db.table('messages')
        .orderBy({index: db.desc('date')})
        .filter(db.row('userId').eq(userId)
          .and(db.row('convoId').eq(convoId)))
        .eqJoin('convoId', db.table('convos'))
        .without({'right': {'id': true}})
        .zip()
        .slice(min, max)
        .map(function(m) {
          return {
            id: m('id'),
            convoId: m('convoId'),
            convoName: m('name'),
            date: m('date'),
            author: m('author'),
            text: m('text'),
            fromMe: m('fromMe'),
          };
        })
        .run(this.conn);
    } catch(error) {
      console.error(error);
    }

    return await c.toArray();
  }

  async lastMessage(userId) {
    try {
      let c = await db.table('messages')
        .orderBy({index: db.desc('date')})
        .filter(db.row('userId').eq(userId))
        .limit(1)
        .run(this.conn);

      let res = await c.toArray();
      return res[0];
    } catch(err) {
      console.error(err);
    }
  }

  async listConvos(userId, page = 0, pageSize = 50) {
    let min = page * pageSize;
    let max = min + pageSize;
    let c;
    try {
    c = await db.table('convos')
      .orderBy({index: db.desc('lastMessageDate')})
      .filter(db.row('userId').eq(userId))
      .slice(min, max)
      .map(function(c) {
        let count = db.table('messages')
          .filter(function(m) {
            return m('convoId').eq(c('id'));
          })
          .count();

        return {
          id: c('id'),
          name: c('name'),
          lastMessageDate: c('lastMessageDate'),
          messageCount: count,
        };
      })
      .run(this.conn);
    } catch(error) {
      console.error(error);
    }

    return await c.toArray();
  }

  /**
   * Add a message listener for a user. The callback will be called when
   * the store receives a new message for that user.
   *
   * @param {String} userId
   * @param {Function} callback
   */
  addMessageListener(userId, callback) {
    if(!this.users.has(userId)) {
      this.users.set(userId, new Map());
    }
    this.users.get(userId).set(callback, callback);
  }

  /**
   * Removes a change listener.
   *
   * @param {String} userId
   * @param {Function} callback
   */
  removeMessageListener(userId, callback) {
    if(this.users.get(userId)) {
      this.users.get(userId).delete(callback);
    }
  }
}
