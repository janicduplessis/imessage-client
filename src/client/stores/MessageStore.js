import { Map, List, fromJS } from 'immutable';
import { Flux, Store } from '../flux';
import MessageActions from '../actions/MessageActions';

class MessageStore extends Store {
  constructor() {
    super();

    this.register(MessageActions.receiveMessage, this._handleMessage);
    this.register(MessageActions.listMessages, this._handleListMessages);
    this.register(MessageActions.listConvos, this._handleListConvos);

    this.state = {
      convos: new Map(),
    };
  }

  listMessages(convoId) {
    if(this.state.convos.get(convoId)) {
      return this.state.convos.getIn([convoId, 'messages']);
    }
    return new List();
  }

  listConvos() {
    return this.state.convos;
  }

  _handleMessage(message) {
    let newMessages;
    const convo = this._getConvo(message.convoId, message.convoName);
    const messages = convo.get('messages');
    // Check if the message we received is already there but without and id.
    if(message.id.indexOf('tmp_') >= 0) {
      const oldMesIndex = messages.findIndex((m) => {
        return !m.get('id')
          && m.get('text') === message.text
          && m.get('convoName') === message.convoName;
      });
      if(oldMesIndex >= 0) {
        newMessages = messages.setIn([oldMesIndex, 'id'], message.id);
      } else {
        newMessages = messages.unshift(fromJS(message));
      }
    } else {
      newMessages = messages.unshift(fromJS(message));
    }
    this.setState({
      convos: this.state.convos.setIn([message.convoId, 'messages'], newMessages),
    });
  }

  _handleListMessages({convoId, messages}) {
    if(messages.length === 0) {
      return;
    }
    const convoName = messages[0].convoName;
    let convo = this._getConvo(convoId, convoName);
    convo = convo.set('loaded', true);
    const newMessages = convo.get('messages').concat(fromJS(messages));

    convo = convo.set('messages', newMessages);

    this.setState({
      convos: this.state.convos.set(convoId, convo),
    });
  }

  _handleListConvos(convos) {
    let newConvos = this.state.convos;
    for(let c of convos) {
      if(!this.state.convos.get(c.id)) {
        newConvos = newConvos.set(c.id, fromJS({
          id: c.id,
          name: c.name,
          messages: [],
          loaded: false,
        }));
      }
    }
    this.setState({
      convos: newConvos,
    });
  }

  /**
   * Gets the conversation by id. Creates a new one if it doesn't exists.
   *
   * @param  {string} convoId Conversation id
   * @param {string} convoName The name to use for the convo if it doesnt exist.
   * @return {Map}
   */
  _getConvo(convoId, convoName) {
    let convo = this.state.convos.get(convoId);
    if(!convo) {
      convo = fromJS({
        id: convoId,
        name: convoName,
        messages: [],
        loaded: false,
      });
      this.setState({
        convos: this.state.convos.set(convoId, convo),
      });
    }
    return convo;
  }
}

export default Flux.createStore('message', MessageStore);
