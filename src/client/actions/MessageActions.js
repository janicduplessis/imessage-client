import R from 'ramda';

import state from '../state';
import ApiUtils from '../utils/ApiUtils';
//import Optimist from '../utils/Optimist';

export default {
  async send(message) {
    //this.receiveMessage(message);
    ApiUtils.sendMessage(message);
  },

  async listMessages(convoId) {
    try {
      let messages = await ApiUtils.listMessages(convoId);
      state.set(['messages', 'models'],
        R.merge(state.get(['messages', 'models']), messages));
    } catch(err) {
      console.error(err);
    }
  },

  async listConvos() {
    try {
      let convos = await ApiUtils.listConvos();
      state.set(['convos', 'models'],
        R.merge(state.get(['convos', 'models']), convos));
    } catch(err) {
      console.error(err);
    }
  },

  receiveMessage(message) {
    state.set(['messages', 'models', message.id], message);
  },

  setCurrentConvo(convoId) {
    this.listMessages(convoId);
    state.set(['currentConvoId'], convoId);
  },

  connect() {
    ApiUtils.connect();
    ApiUtils.onMessage((message) => {
      this.receiveMessage(message);
    });
  },
};
