/* global io */

import Storage from './Storage';

const URL_BASE = '/api';
const URL_LOGIN = URL_BASE + '/login';
const URL_REGISTER = URL_BASE + '/register';
const URL_CONVOS = URL_BASE + '/convos';
const URL_MESSAGES = URL_BASE + '/messages/:convoId';

const Method = {
  GET: 'GET',
  POST: 'POST',
};

/**
 * Helpers for using the server Api.
 * REST api + socket.io.
 */
class ApiUtils {
  constructor() {
    this.socket = null;
    this.token = Storage.getItem('token') || null;

    this.socket = io.connect();
    this.messageCallback = null;

    this.socket.on('authenticated', () => {
      this._sendSocket('ready');
    });

    this.socket.on('message', (message) => {
      if(this.messageCallback) {
        this.messageCallback.call(null, message);
      }
    });
  }

  /**
   * Logs the user in.
   *
   * @param {object} loginInfo - User login info
   */
  async login(loginInfo) {
    const resp = await this._send(Method.POST, URL_LOGIN, loginInfo);
    if(resp.token) {
      this._setToken(resp.token);
    }
    return resp;
  }

  /**
   * Registers the user.
   *
   * @param  {object} registerInfo - User registration info
   */
  async register(registerInfo) {
    const resp = await this._send(Method.POST, URL_REGISTER, registerInfo);
    if(resp.token) {
      this._setToken(resp.token);
    }
    return resp;
  }

  async listConvos() {
    return await this._send(Method.GET, URL_CONVOS);
  }

  async listMessages(convoId) {
    return await this._send(Method.GET, URL_MESSAGES.replace(':convoId', convoId));
  }

  async connect() {
    if(this.socket.disconnected) {
      this.socket.connect();
    }
    this._sendSocket('authenticate', {token: this.token});
  }

  sendMessage(message) {
    this._sendSocket('send', {message: message});
  }

  onMessage(callback) {
    this.messageCallback = callback;
  }

  _setToken(token) {
    Storage.setItem('token', token);
    this.token = token;
  }

  async _send(method, url, params = null) {
    let body = null;
    if(params) {
      body = JSON.stringify(params);
    }
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    if(this.token) {
      headers['Authorization'] = 'Bearer ' + this.token;
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
