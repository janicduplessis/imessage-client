import React from 'react';
import { RouteHandler } from 'react-router';
import NavBar from './NavBar';
import UserStore from '../stores/UserStore';
import MessageActions from '../actions/MessageActions';

import '../styles/app.scss';

class AppHandler extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      user: UserStore.get(),
    };
  }

  componentDidMount() {
    UserStore.listen(this._userChanged.bind(this));

    if(this.state.user) {
      MessageActions.connect();
    }
  }

  componentWillUnmount() {
    UserStore.unlisten(this._userChanged.bind(this));
  }

  render() {
    return (
      <div className="app vbox">
        <NavBar user={this.state.user}/>
        <div className="page-content vbox">
          <div className="content vbox">
            <RouteHandler {...this.props} key={this.props.pathname} />
          </div>
        </div>
      </div>
    );
  }

  _userChanged() {
    let { router } = this.context;
    let user = UserStore.get();
    if(user !== null) {
      MessageActions.connect();
      router.replaceWith('/chat');
    } else {
      router.replaceWith('/login');
    }

    this.setState({
      user: user,
    });
  }
}

AppHandler.contextTypes = {
  router: React.PropTypes.func,
};

export default AppHandler;
