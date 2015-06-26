import React from 'react';
import StyleSheet from 'react-style';
import {
  Paper,
} from 'material-ui';

import colors from '../utils/colors';
import UserUtils from '../utils/UserUtils';

class Message extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      hovered: false,
    };
  }

  render() {
    let name = this.state.hovered ? this.props.author : this._initialsFromName(this.props.author);
    let author = (
      <div
          key="0"
          className="message-author"
          styles={this._authorStyles()}
          onMouseOver={this._onMouseOver.bind(this)}
          onMouseOut={this._onMouseOut.bind(this)}>
        {name}
      </div>);
    let message = <Paper key="1" className="message-text" style={styles.text}>{this.props.text}</Paper>;
    let content;
    if(this.props.showAuthor) {
      content = this.props.fromMe ? [message, author] : [author, message];
    } else {
      content = message;
    }
    return (
      <div styles={this._messageStyles()}>
        {content}
      </div>
    );
  }

  _messageStyles() {
    let messageStyles = this.props.fromMe ? [styles.message, styles.fromMe] : [styles.message];
    if(!this.props.showAuthor) {
      messageStyles.push(this.props.fromMe ? styles.padRight : styles.padLeft);
    } else {
      messageStyles.push(styles.padTop);
    }

    return messageStyles;
  }

  _authorStyles() {
    let color = UserUtils.getColorForUser(this.props.author);
    let authorStyles = [styles.author];

    if(!this.props.fromMe) {
      authorStyles.push({backgroundColor: color});
      if(this.state.hovered) {
        authorStyles.push(styles.authorHovered);
      }
    }
    return authorStyles;
  }

  _onMouseOver() {
    this.setState({
      hovered: true,
    });
  }

  _onMouseOut() {
    this.setState({
      hovered: false,
    });
  }

  _initialsFromName(name) {
    let parts = name.split(' ');
    if(parts.length < 2) {
      return parts[0].substring(0, 2);
    } else {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
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
  },
  fromMe: {
    justifyContent: 'flex-end',
  },
  author: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: 18,
    color: '#fff',
    fontSize: 16,
    transition: 'all 750ms cubic-bezier(0.23, 1, 0.32, 1)',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    opacity: 1,
  },
  authorHovered: {
    width: 'auto',
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: 4,
    opacity: 0.8,
  },
  padRight: {
    marginRight: 36,
  },
  padLeft: {
    marginLeft: 36,
  },
  padTop: {
    marginTop: 8,
  },
  text: {
    padding: 8,
    margin: 8,
    fontSize: 16,
  },
});

export default Message;
