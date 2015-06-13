import React from 'react';
import StyleSheet from 'react-style';
import {
  FloatingActionButton,
  Paper,
} from 'material-ui';

import colors from './colors';

class SendBox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      message: '',
    };
  }

  render() {
    return (
      <div styles={[styles.container, this.props.style]}>
        <Paper zDepth={3} style={styles.sendBox}>
          <textarea
            style={styles.textarea}
            onChange={this._messageChanged.bind(this)}
            onKeyUp={this._textAreaKeyUp.bind(this)}
            placeholder="Reply..."
            value={this.state.message} />
        </Paper>
        <FloatingActionButton
          iconClassName="material-icons send-icon"
          style={styles.send}
          onClick={this._sendMessage.bind(this)} />
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
      event.stopPropagation();
    }
  }

  _sendMessage() {
    if(this.state.message.trim().length > 0) {
      this.props.onMessage(this.state.message);
    }
    this.setState({
      message: '',
    });
  }
}

SendBox.propTypes = {
  onMessage: React.PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    alignItems: 'flex-start',
  },
  sendBox: {
    display: 'flex',
    flex: 1,
    backgroundColor: colors.primary,
    marginTop: 0,
    marginBottom: 16,
    marginLeft: 0,
    marginRight: 8,
  },
  textarea: {
    flex: 1,
    resize: 'none',
    backgroundColor: 'rgba(0,0,0,0)',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: 16,
    padding: 8,
  },
  send: {
    marginTop: 0,
  },
  sendIcon: {
    color: '#fff',
  },
});

export default SendBox;
