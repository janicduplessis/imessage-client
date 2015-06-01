import React from 'react';
import StyleSheet from 'react-style';
import {
  RaisedButton,
} from 'material-ui';

import Storage from '../utils/Storage';

class AccountHandler extends React.Component {
  render() {
    return (
      <div>
        <h1>Account</h1>

        <RaisedButton onClick={this._logout.bind(this)} label="Logout" />
      </div>
    );
  }

  _logout() {
    Storage.clear();
    this.context.router.replaceWith('/login');
    window.location.reload();
  }
}

export default AccountHandler;
