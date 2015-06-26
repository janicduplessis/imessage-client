/* @flow */

import React from 'react';
import {
  RaisedButton,
} from 'material-ui';

import Storage from '../utils/Storage';

export default class AccountHandler extends React.Component {

  static contextTypes = {
    router: React.PropTypes.func.isRequired,
  };

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
