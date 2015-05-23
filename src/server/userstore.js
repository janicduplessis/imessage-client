import db from 'rethinkdb';
import bcrypt from 'bcryptjs';

export default class UserStore {
  constructor(conn) {
    this.conn = conn;
  }

  async login(username, password) {
    let c = await db.table('users')
      .filter(db.row('username').eq(username))
      .limit(1)
      .run(this.conn);
    let res = await c.toArray();
    let user = res[0];
    if(!user) {
      return {error: 'ERR_USERNAME'};
    }

    let ok = bcrypt.compareSync(password, user.passwordHash);
    if(!ok) {
      return {error: 'ERR_PASSWORD'};
    }
    return {
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async register(username, password, firstName, lastName) {
    const passwordHash = bcrypt.hashSync(password, 10);

    const c = await db.table('users')
      .filter(db.row('username').eq(username))
      .limit(1)
      .run(this.conn);
    const res = await c.toArray();
    if(res.length > 0) {
      return {error: 'ERR_NOT_AVAILABLE'};
    }

    const result = await db.table('users')
      .insert({
        username: username,
        passwordHash: passwordHash,
        firstName: firstName,
        lastName: lastName,
      })
      .run(this.conn);

    return {
      user: {
        id: result.generated_keys[0],
        username: username,
        firstName: firstName,
        lastName: lastName,
      },
    };
  }
}
