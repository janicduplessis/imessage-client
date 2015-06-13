import { OrderedMap, List, fromJS } from 'immutable';
import { Flux, Store } from '../flux';
import MessageActions from '../actions/MessageActions';

class MessageStore extends Store {
  constructor() {
    super();

    this.register(MessageActions.receiveMessage, this._handleMessage);
    this.register(MessageActions.listMessages, this._handleListMessages);
    this.register(MessageActions.listConvos, this._handleListConvos);

    this.state = {
      convos: new OrderedMap(),
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
    let convo = this._getConvo(message.convoId, message.convoName);
    convo = convo.set('dateLastMessage', new Date());
    let messages = convo.get('messages');
    // Check if the message we received is already there but without and id.
    if(message.id.indexOf('tmp_') < 0) {
      let oldMesIndex = messages.findIndex((m) => {
        return m.get('id').indexOf('tmp_') >= 0
          && m.get('text') === message.text
          && m.get('convoName') === message.convoName
          && m.get('fromMe') === message.fromMe;
      });
      if(oldMesIndex >= 0) {
        newMessages = messages.setIn([oldMesIndex, 'id'], message.id);
      } else {
        newMessages = messages.unshift(fromJS(message));
      }
    } else {
      newMessages = messages.unshift(fromJS(message));
    }

    convo = convo.set('messages', newMessages);

    let convos = this.state.convos.set(message.convoId, convo)
      .sort((a, b) => {
        return (a.get('dateLastMessage') && a.get('dateLastMessage').getTime() || 0)
          < (b.get('dateLastMessage') && b.get('dateLastMessage').getTime() || 0) ? 1 : -1;
      });

    this.setState({
      convos: convos,
    });
  }

  _handleListMessages({convoId, messages}) {
    if(messages.length === 0) {
      return;
    }
    let convoName = messages[0].convoName;
    let convo = this._getConvo(convoId, convoName);
    convo = convo.set('loaded', true);
    let newMessages = convo.get('messages').concat(fromJS(messages));

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

      this.state.convos = this.state.convos.set(convoId, convo);
    }
    return convo;
  }
}

export default Flux.createStore('message', MessageStore);
