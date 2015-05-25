import React from 'react';

import MessageStore from '../stores/MessageStore';
import MessageActions from '../actions/MessageActions';

class ChatHandler extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: MessageStore.listMessages(null),
      convos: MessageStore.listConvos(),
      curConvo: null,
      message: '',
    };

    this._messageStoreListener = this._onStoreChange.bind(this);
  }

  componentDidMount() {
    MessageStore.listen(this._messageStoreListener);

    MessageActions.listConvos();
  }

  componentWillUnmount() {
    MessageStore.unlisten(this._messageStoreListener);
  }

  render() {
    const convos = this.state.convos.map((c, i) => {
      return (
        <div
          onClick={this._changeConvo.bind(this, c.get('id'))}
          key={i}>
            {c.get('name')}
        </div>
      );
    }).toList();
    if(!this.state.curConvo) {
      return (
        <div>
          <div>{convos}</div>
          <div>
            No conversation selected
          </div>
        </div>
      );
    }
    const messages = this.state.messages.map((m, i) => {
      return <div key={i}>{m.get('author')}: {m.get('text')}</div>;
    });
    return (
      <div>
        <h1>Chat</h1>
        <div>{convos}</div>
        <div>{messages}</div>
        <textarea
          onChange={this._messageChanged.bind(this)}
          onKeyUp={this._textAreaKeyUp.bind(this)}
          value={this.state.message} />
        <button onClick={this._sendMessage.bind(this)}>Send</button>
      </div>
    );
  }

  _messageChanged(event) {
    this.setState({
      message: event.target.value,
    });
  }

  _textAreaKeyUp(event) {
    // Submit when enter key is pressed. Shift-enter will still change line.
    if(event.keyCode === 13 && !event.shiftKey) {
      this._sendMessage();
      event.preventDefault();
    }
  }

  _sendMessage() {
    MessageActions.send({
      author: 'me',
      text: this.state.message,
      convoName: this.state.curConvo.get('name'),
      convoId: this.state.curConvo.get('id'),
    });
    this.setState({
      message: '',
    });
  }

  _changeConvo(convoId) {
    const convo = this.state.convos.get(convoId);
    // If we haven't loaded old messages for this convo do it.
    if(!convo.get('loaded')) {
      MessageActions.listMessages(convoId);
    }
    this.setState({
      curConvo: convo,
      messages: MessageStore.listMessages(convoId),
    });
  }

  _onStoreChange() {
    const convoId = this.state.curConvo ? this.state.curConvo.get('id') : null;
    this.setState({
      convos: MessageStore.listConvos(),
      messages: MessageStore.listMessages(convoId),
    });
  }
}

export default ChatHandler;
