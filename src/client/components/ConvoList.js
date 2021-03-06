import React from 'react';
import StyleSheet from 'react-style';
import {
  Paper,
} from 'material-ui';

import colors from '../utils/colors';

class ConvoList extends React.Component {

  render() {
    let convos = this.props.convos.map((c) => {
      let selected = this.props.curConvo && c.id === this.props.curConvo.id;
      let convStyles = selected ? [styles.convo, styles.selectedConvo] : [styles.convo];
      return (
        <div
          styles={convStyles}
          onClick={this._onConvoChanged.bind(this, c.id)}
          key={c.id}>
            {c.name}
        </div>
      );
    });

    return (
      <div styles={[styles.scroll]}>
        <Paper style={styles.convos}>
          {convos}
        </Paper>
      </div>
    );
  }

  _onConvoChanged(id) {
    if(this.props.onConvoChanged) {
      this.props.onConvoChanged(id);
    }
  }
}

ConvoList.propTypes = {
  convos: React.PropTypes.array,
  curConvo: React.PropTypes.object,
  onConvoChanged: React.PropTypes.func,
};

const styles = StyleSheet.create({
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
  scroll: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'auto',
  },
});

export default ConvoList;
