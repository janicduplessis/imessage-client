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
    let c = await db.table('messages')
      .changes()
      .getField('new_val')
      .run(this.conn);

    c.each((err, message) => {
      if(err) {
        console.error(err);
        return;
      }

      let userCallbacks = this.users.get(message.userId);
      if(userCallbacks) {
        for(let cb of userCallbacks.values()) {
          cb.call(null, message);
        }
      }
    });
  }

  /**
   * Add a message to the store.
   * @param message {Object}
   */
  async add(userId, message) {
    let dbMessage = Object.assign({userId: userId}, message);
    await db.table('messages')
      .insert(dbMessage)
      .run(this.conn);
  }

  /**
   * Get all messages for a user.
   * @param userId {String}
   * @return {Array}
   */
  async list(userId) {
    let c = await db.table('messages')
      .filter(db.row('userId').eq(userId))
      .run(this.conn);

    let messages = await c.toArray();
    return messages.map((m) => {
      return {
        id: m.id,
        message: m.message,
        recipients: m.recipients,
      };
    });
  }

  /**
   * Add a message listener for a user. The callback will be called when
   * the store receives a new message for that user.
   * @param userId {String}
   * @param callback {Function}
   */
  addMessageListener(userId, callback) {
    if(!this.users.has(userId)) {
      this.users.set(userId, new Map());
    }
    this.users.get(userId).set(callback, callback);
  }

  /**
   * Removes a change listener.
   * @param userId {String}
   * @param callback {Function}
   */
  removeMessageListener(userId, callback) {
    this.users.get(userId).delete(callback);
  }
}
