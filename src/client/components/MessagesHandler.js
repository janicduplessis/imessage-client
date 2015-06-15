import React from 'react';
import StyleSheet from 'react-style';

import MessageList from './MessageList';
import SendBox from './SendBox';
import MessageStore from '../stores/MessageStore';
import MessageActions from '../actions/MessageActions';
import UIActions from '../actions/UIActions';

class MessagesHandler extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: MessageStore.listMessages(this.props.params.id),
    };

    this._messageStoreListener = this._onStoreChange.bind(this);
  }

  componentDidMount() {
    MessageStore.listen(this._messageStoreListener);

    let convo = MessageStore.convo(this.props.params.id);
    if(convo) {
      UIActions.title(convo.get('name'));
    }

    UIActions.backButton(true);
  }

  componentWillUnmount() {
    MessageStore.unlisten(this._messageStoreListener);

    UIActions.title(null);
    UIActions.backButton(false);
  }

  render() {
    return (
      <div style={styles.container}>
        <MessageList messages={this.state.messages} />
        <SendBox style={styles.sendbox} onMessage={this._sendMessage.bind(this)} />
      </div>
    );
  }

  _sendMessage(message) {
    MessageActions.send({
      id: 'tmp_' + Math.random(),
      author: 'me',
      text: message,
      convoName: this.state.curConvo.get('name'),
      convoId: this.state.curConvo.get('id'),
      fromMe: true,
    });
  }

  _onStoreChange() {
    this.setState({
      messages: MessageStore.listMessages(this.props.params.id),
    });
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    right: 0,
    bottom: 0,
  },
  sendbox: {
    position: 'absolute',
    left: 0,
    right: 12,
    bottom: 0,
  },
});

export default MessagesHandler;
