import React from 'react';
import StyleSheet from 'react-style';
import {branch} from 'baobab-react/decorators';

import MessageList from './MessageList';
import SendBox from './SendBox';
import MessageActions from '../actions/MessageActions';
import UIActions from '../actions/UIActions';

@branch({
  facets: {
    messages: 'visibleMessages',
    convo: 'currentConvo',
  },
})
class MessagesHandler extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let convo = this.props.convo;
    if(convo) {
      UIActions.title(convo.name);
    }

    UIActions.backButton(true);
  }

  componentWillUnmount() {
    UIActions.title(null);
    UIActions.backButton(false);
  }

  render() {
    return (
      <div style={styles.container}>
        <MessageList messages={this.props.messages} />
        <SendBox style={styles.sendbox} onMessage={this._sendMessage.bind(this)} />
      </div>
    );
  }

  _sendMessage(message) {
    let convo = this.props.convo;
    MessageActions.send({
      id: 'tmp_' + Math.random(),
      author: 'me',
      text: message,
      convoName: convo.name,
      convoId: convo.id,
      fromMe: true,
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
    left: 12,
    right: 12,
    bottom: 0,
  },
});

export default MessagesHandler;
