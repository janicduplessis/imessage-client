import React from 'react';
import StyleSheet from 'react-style';
import {branch} from 'baobab-react/decorators';

import ConvoList from '../components/ConvoList';
import MessageActions from '../actions/MessageActions';

@branch({
  facets: {
    convos: 'visibleConvos',
  },
})
export default class ConvosHandler extends React.Component {

  static contextTypes = {
    router: React.PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    MessageActions.listConvos();
  }

  render() {
    return (
      <div style={styles.container}>
        <div>
          <ConvoList
            convos={this.props.convos}
            curConvo={this.props.curConvo}
            onConvoChanged={this._changeConvo.bind(this)} />
        </div>
      </div>
    );
  }

  _changeConvo(convoId) {
    MessageActions.setCurrentConvo(convoId);
    this.context.router.transitionTo('convo', {id: convoId});
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
