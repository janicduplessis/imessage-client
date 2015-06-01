import React from 'react';
import StyleSheet from 'react-style';
import TransitionGroup from 'react/lib/ReactCSSTransitionGroup';
import {RouteHandler} from 'react-router';
import NavBar from './NavBar';
import UserStore from '../stores/UserStore';
import MessageActions from '../actions/MessageActions';
import ThemeManager from 'material-ui/lib/styles/theme-manager';

import colors from './colors';
import '../styles/app.scss';

class AppHandler extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      user: UserStore.get(),
    };
    this.themeManager = new ThemeManager();
  }

  getChildContext() {
    return {
      muiTheme: this.themeManager.getCurrentTheme(),
    };
  }

  componentWillMount() {
    this.themeManager.setPalette({
      primary1Color: colors.primary,
      accent1Color: colors.accent,
    });
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
    const name = this.context.router.getCurrentPath();
    return (
      <div className="app vbox">
        <NavBar user={this.state.user} router={this.context.router}/>
        <div className="vbox" style={styles.content}>
          <TransitionGroup
              transitionName="content-fade"
              component="div"
              className={'content vbox ' + this._curRouteClassName()}>
            <RouteHandler {...this.props} key={name} />
          </TransitionGroup>
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

  _curRouteClassName() {
    return 'page-' + this.context.router.getRouteAtDepth(1).name;
  }
}

AppHandler.childContextTypes = {
  muiTheme: React.PropTypes.object,
};

AppHandler.contextTypes = {
  router: React.PropTypes.func,
};

const styles = StyleSheet.create({
  content: {
    backgroundColor: '#FBFBFB',
  },
});

export default AppHandler;
