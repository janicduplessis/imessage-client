import React from 'react';

import MessageStore from '../stores/MessageStore';
import MessageActions from '../actions/MessageActions';

class ChatHandler extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: MessageStore.list(),
      message: '',
      convo: 'janicduplessis@gmail.com'/*'😎Hit Squad😎'*/,
    };

    this._messageStoreListener = this._onChange.bind(this);
  }

  componentDidMount() {
    MessageStore.listen(this._messageStoreListener);
  }

  componentWillUnmount() {
    MessageStore.unlisten(this._messageStoreListener);
  }

  render() {
    const messages = this.state.messages.map((m, i) => {
      return <div key={i}>{m.get('author')}: {m.get('text')}</div>;
    });
    return (
      <div>
        <h1>Chat</h1>
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
      convo: this.state.convo,
    });
    this.setState({
      message: '',
    });
  }

  _onChange() {
    this.setState({
      messages: MessageStore.list(),
    });
  }
}

export default ChatHandler;
