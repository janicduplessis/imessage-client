import React from 'react';
import TransitionGroup from 'react/lib/ReactCSSTransitionGroup';
import StyleSheet from 'react-style';

import Message from './Message';

class MessageList extends React.Component {
  constructor(props) {
    super(props);

    this.shouldScrollBottom = true;
  }

  componentWillUpdate() {
    const scrollArea = this.refs.scroll.getDOMNode();
    this.shouldScrollBottom = scrollArea.scrollTop +
      scrollArea.offsetHeight === scrollArea.scrollHeight;
  }

  componentDidUpdate() {
    if (this.shouldScrollBottom) {
      const scrollArea = this.refs.scroll.getDOMNode();
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }

  render() {
    const messages = this.props.messages.map((m, i, self) => {
      let showAuthor = true;
      let prev = self.get(i + 1);
      if(prev) {
        showAuthor = prev.get('author') !== m.get('author');
      }
      return (
        <Message
          author={m.get('author')}
          showAuthor={showAuthor}
          text={m.get('text')}
          fromMe={m.get('fromMe')}
          key={m.get('id')} />
      );
    });
    return (
      <div style={styles.messagesContainer}>
        <div ref="scroll" style={styles.scroll}>
          <TransitionGroup
              style={styles.messages}
              transitionName="message-animation"
              component="div">
            {messages}
          </TransitionGroup>
        </div>
      </div>
    );
  }
}

MessageList.propTypes = {
  messages: React.PropTypes.object.isRequired, //TODO: use immutablejs prop types.
};

const styles = StyleSheet.create({
  scroll: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'auto',
  },
  messagesContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    position: 'relative',
  },
  messages: {
    display: 'flex',
    flexDirection: 'column-reverse',
    flex: 1,
    flexShrink: 0,
    marginBottom: 72,
    marginRight: 12,
    marginLeft: 12,
  },
});

export default MessageList;
