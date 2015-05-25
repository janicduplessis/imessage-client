import React from 'react';
import Storage from '../utils/Storage';

class LogoutHandler extends React.Component {
  componentDidMount() {
    Storage.clear();
    this.context.router.replaceWith('/login');
    window.location.reload();
  }

  render() {
    return null;
  }
}

LogoutHandler.contextTypes = {
  router: React.PropTypes.func,
};

export default LogoutHandler;
