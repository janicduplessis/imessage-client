import React from 'react';

import MessageStore from '../stores/MessageStore';
import MessageActions from '../actions/MessageActions';

class ChatHandler extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: MessageStore.list(),
      message: '',
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
    const messages = this.state.messages.map((m) => {
      return <div>{m.get('message')}</div>;
    });
    return (
      <div>
        <h1>Chat</h1>
        <div>{messages}</div>
        <textarea
          onChange={this._messageChanged.bind(this)}
          value={this.state.message} />
        <button onClick={this._sendMessage.bind(this)}>test</button>
      </div>
    );
  }

  _messageChanged(event) {
    this.setState({
      message: event.target.value,
    });
  }

  _sendMessage() {
    MessageActions.send({
      message: this.state.message,
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
