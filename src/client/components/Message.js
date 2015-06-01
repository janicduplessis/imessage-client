import React from 'react';
import StyleSheet from 'react-style';
import {
  Paper,
} from 'material-ui';

import colors from './colors';
import UserUtils from '../utils/UserUtils';

class Message extends React.Component {
  render() {
    const name = this.props.author.charAt(0).toUpperCase();
    const author = (
      <div
          key="0"
          className="message-author"
          styles={this._authorStyles()}>
        {name}
      </div>);
    const message = <Paper key="1" className="message-text" style={styles.text}>{this.props.text}</Paper>;
    const content = this.props.fromMe ? [message, author] : [author, message];
    return (
      <div styles={this._messageStyles()}>
        {content}
      </div>
    );
  }

  _messageStyles() {
    return this.props.fromMe ? [styles.message, styles.fromMe] : [styles.message];
  }

  _authorStyles() {
    const color = UserUtils.getColorForUser(this.props.author);
    return this.props.fromMe ? [styles.author] : [styles.author, {backgroundColor: color}];
  }
}

Message.propTypes = {
  text: React.PropTypes.string.isRequired,
  author: React.PropTypes.string.isRequired,
  fromMe: React.PropTypes.bool.isRequired,
};

const styles = StyleSheet.create({
  message: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  fromMe: {
    justifyContent: 'flex-end',
  },
  author: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: 16,
    color: '#fff',
    fontSize: 16,
  },
  text: {
    padding: 8,
    margin: 8,
    fontSize: 16,
  },
});

export default Message;
