import { List, fromJS } from 'immutable';
import { Flux, Store } from '../flux';
import MessageActions from '../actions/MessageActions';

class MessageStore extends Store {
  constructor() {
    super();

    this.register(MessageActions.receiveMessage, this._handleMessage);

    this.state = {
      messages: new List(),
    };
  }

  list() {
    return this.state.messages;
  }

  _handleMessage(message) {
    this.setState({
      messages: this.state.messages.push(fromJS(message)),
    });
  }
}

export default Flux.createStore('message', MessageStore);
