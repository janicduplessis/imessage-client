/* global io */

const URL_BASE = '/api';
const URL_LOGIN = URL_BASE + '/login';
const URL_REGISTER = URL_BASE + '/register';

const Method = {
  GET: 'GET',
  POST: 'POST',
};

class ApiUtils {
  constructor() {
    this.socket = null;
    this.token = localStorage.token || null;
  }

  async login(loginInfo) {
    const resp = await this._send(Method.POST, URL_LOGIN, loginInfo);
    if(resp.token) {
      this.token = resp.token;
    }
    return resp;
  }

  async register(registerInfo) {
    const resp = await this._send(Method.POST, URL_REGISTER, registerInfo);
    if(resp.token) {
      this.token = resp.token;
    }
    return resp;
  }

  async connect() {
    return new Promise((resolve) => {
      this.socket = io.connect();
      this.socket.on('authenticated', () => {
        this._sendSocket('ready');
        resolve();
      });
      this._sendSocket('authenticate', {token: this.token});
    });
  }

  sendMessage(message) {
    this._sendSocket('send', {message: message});
  }

  onMessage(callback) {
    if(!this.socket) {
      throw Error('No connection');
    }
    this.socket.on('message', (message) => {
      callback.call(null, message);
    });
  }

  async _send(method, url, params) {
    if(typeof params !== 'object') {
      throw Error('params must be an object');
    }
    const body = JSON.stringify(params);
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    if(this.token) {
      headers['Authorization'] = this.token;
    }

    return await fetch(url, {
      method: method,
      body: body,
      headers: headers,
    }).then(resp => resp.json());
  }

  _sendSocket(url, params) {
    if(!this.socket) {
      throw Error('No connection');
    }
    params = Object.assign({
      type: 'client',
    }, params);
    this.socket.emit(url, params);
  }
}

export default new ApiUtils();
