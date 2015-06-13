import React from 'react';
import TransitionGroup from 'react/lib/ReactCSSTransitionGroup';
import StyleSheet from 'react-style';
import {
  Paper,
} from 'material-ui';

import MessageList from './MessageList';
import SendBox from './SendBox';
import colors from './colors';
import MessageStore from '../stores/MessageStore';
import MessageActions from '../actions/MessageActions';

class ChatHandler extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: MessageStore.listMessages(null),
      convos: MessageStore.listConvos(),
      curConvo: null,
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
      const selected = this.state.curConvo && c.get('id') === this.state.curConvo.get('id');
      const convStyles = selected ? [styles.convo, styles.selectedConvo] : [styles.convo];
      return (
        <div
          styles={convStyles}
          onClick={this._changeConvo.bind(this, c.get('id'))}
          key={i}>
            {c.get('name')}
        </div>
      );
    }).toList();

    const sendbox = this.state.curConvo ? <SendBox style={styles.sendbox} onMessage={this._sendMessage.bind(this)} /> : null;

    return (
      <div style={styles.container}>
        <div style={styles.chat}>
          <div style={styles.left}>
            <div styles={[styles.scroll]}>
              <Paper style={styles.convos}>
                {convos}
              </Paper>
            </div>
          </div>
          <div style={styles.right}>
            <MessageList messages={this.state.messages} />
            {sendbox}
          </div>
        </div>
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

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    right: 0,
    bottom: 0,
  },
  chat: {
    display: 'flex',
    flex: 1,
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    position: 'relative',
    marginRight: 16,
  },
  right: {
    display: 'flex',
    flexDirection: 'column',
    flex: 2,
    position: 'relative',
  },
  scroll: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'auto',
  },
  sendbox: {
    position: 'absolute',
    left: 0,
    right: 12,
    bottom: 0,
  },
  convos: {
    margin: 8,
    marginTop: 16,
  },
  convo: {
    padding: 16,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  selectedConvo: {
    color: colors.primary,
    backgroundColor: '#f0f0f0',
  },
});

export default ChatHandler;
