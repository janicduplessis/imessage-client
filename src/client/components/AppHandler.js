import React from 'react';
import { RouteHandler } from 'react-router';
import UserStore from '../stores/UserStore';

class AppHandler extends React.Component {

  componentDidMount() {
    UserStore.listen(this._userChanged.bind(this));
  }

  componentWillUnmount() {
    UserStore.unlisten(this._userChanged.bind(this));
  }

  render() {
    return (
      <div>
        <RouteHandler {...this.props} key={this.props.pathname} />
      </div>
    );
  }

  _userChanged() {
    let { router } = this.context;
    if(UserStore.get() !== null) {
      router.replaceWith('/chat');
    } else {
      router.replaceWith('/login');
    }
  }
}

AppHandler.contextTypes = {
  router: React.PropTypes.func,
};

export default AppHandler;
