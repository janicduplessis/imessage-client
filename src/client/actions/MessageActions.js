import { Flux, Actions } from '../flux';
import ApiUtils from '../utils/ApiUtils';

class MessageActions extends Actions {
  send(message) {
    ApiUtils.sendMessage(message);
    this.receiveMessage(message);
  }

  async listMessages(convoId) {
    try {
      const messages = await ApiUtils.listMessages(convoId);
      return {convoId, messages};
    } catch(err) {
      console.error(err);
    }
  }

  async listConvos() {
    try {
      return await ApiUtils.listConvos();
    } catch(err) {
      console.error(err);
    }
  }

  receiveMessage(message) {
    return message;
  }

  connect() {
    ApiUtils.connect();
    ApiUtils.onMessage((message) => {
      this.receiveMessage(message);
    });
  }
}

export default Flux.createActions('message', MessageActions);
