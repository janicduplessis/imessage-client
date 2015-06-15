import React from 'react';
import StyleSheet from 'react-style';

import ConvoList from './ConvoList';
import MessageStore from '../stores/MessageStore';
import MessageActions from '../actions/MessageActions';

export default class ConvosHandler extends React.Component {

  static contextTypes = {
    router: React.PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
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
    return (
      <div style={styles.container}>
        <div>
          <ConvoList
            convos={this.state.convos}
            curConvo={this.state.curConvo}
            onConvoChanged={this._changeConvo.bind(this)} />
        </div>
      </div>
    );
  }

  _changeConvo(convoId) {
    let convo = this.state.convos.get(convoId);
    // If we haven't loaded old messages for this convo do it.
    if(!convo.get('loaded')) {
      MessageActions.listMessages(convoId);
    }
    this.setState({
      curConvo: convo,
    });

    this.context.router.transitionTo('convo', {id: convo.get('id')});
  }

  _onStoreChange() {
    this.setState({
      convos: MessageStore.listConvos(),
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
});
