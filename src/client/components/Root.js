import React from 'react';
import {root} from 'baobab-react/decorators';

import AppHandler from './AppHandler';
import state from '../state';

@root(state)
export default class Root extends React.Component {
  render() {
    return <AppHandler />;
  }
}
