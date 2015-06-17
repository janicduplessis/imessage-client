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
  async add(userId, message) {
    let c;

    try {
      c = await db.table('convos')
        .filter(db.row('userId').eq(userId)
          .and(db.row('name').eq(message.convoName)))
        .run(this.conn);
    } catch(err) {
      console.error(err);
      return;
    }
    let convos = await c.toArray();
    let convoId;
    if(convos.length === 0) {
      let res;
      try {
        res = await db.table('convos')
          .insert({
            userId: userId,
            name: message.convoName,
          })
          .run(this.conn);
      } catch(err) {
        console.error(err);
        return;
      }
      convoId = res.generated_keys[0];

    } else {
      convoId = convos[0].id;
    }

    let messageDate = new Date();
    let dbMessage = {
      userId: userId,
      convoId: convoId,
      date: messageDate,
      author: message.author,
      text: message.text,
      fromMe: message.fromMe,
    };

    try {
      await db.table('messages')
        .insert(dbMessage)
        .run(this.conn);
    } catch(err) {
      console.error(err);
    }

    try {
      await db.table('convos')
        .get(convoId)
        .update({lastMessageDate: messageDate})
        .run(this.conn);
    } catch(err) {
      console.error(err);
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
