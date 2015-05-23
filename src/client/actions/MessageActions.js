import { Flux, Actions } from '../flux';
import ApiUtils from '../utils/ApiUtils';

class MessageActions extends Actions {
  send(message) {
    ApiUtils.sendMessage(message);
    this.receiveMessage(message);
  }

  receiveMessage(message) {
    return message;
  }

  connect() {
    try {
      ApiUtils.connect();
    } catch(err) {
      console.err(err);
    }
    ApiUtils.onMessage((message) => {
      this.receiveMessage(message);
    });
  }
}

export default Flux.createActions('message', MessageActions);
