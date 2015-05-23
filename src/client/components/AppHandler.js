import React from 'react';
import { RouteHandler } from 'react-router';
import NavBar from './NavBar';
import UserStore from '../stores/UserStore';
import MessageActions from '../actions/MessageActions';

class AppHandler extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      user: null,
    };
  }

  componentDidMount() {
    UserStore.listen(this._userChanged.bind(this));
  }

  componentWillUnmount() {
    UserStore.unlisten(this._userChanged.bind(this));
  }

  render() {
    return (
      <div>
        <NavBar user={this.state.user}/>
        <RouteHandler {...this.props} key={this.props.pathname} />
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
