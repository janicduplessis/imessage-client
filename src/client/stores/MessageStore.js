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
    let newMessages;
    // Check if the message we received is already there but without and id.
    if(message.id) {
      const oldMesIndex = this.state.messages.findIndex((m) => {
        return !m.get('id')
          && m.get('text') === message.text
          && m.get('convo') === message.convo;
      });
      if(oldMesIndex >= 0) {
        newMessages = this.state.messages.setIn([oldMesIndex, 'id'], message.id);
      } else {
        newMessages = this.state.messages.push(fromJS(message));
      }
    } else {
      newMessages = this.state.messages.push(fromJS(message));
    }
    this.setState({
      messages: newMessages,
    });
  }
}

export default Flux.createStore('message', MessageStore);
