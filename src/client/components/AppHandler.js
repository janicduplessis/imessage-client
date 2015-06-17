import React from 'react';
import StyleSheet from 'react-style';
import TransitionGroup from 'react/lib/ReactCSSTransitionGroup';
import {RouteHandler} from 'react-router';
import NavBar from './NavBar';
import UserStore from '../stores/UserStore';
import UIStore from '../stores/UIStore';
import MessageActions from '../actions/MessageActions';
import ThemeManager from 'material-ui/lib/styles/theme-manager';

import colors from './colors';
import '../styles/app.scss';

export default class AppHandler extends React.Component {

  static childContextTypes = {
    muiTheme: React.PropTypes.object,
  };

  static contextTypes = {
    router: React.PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      user: UserStore.get(),
      title: UIStore.title(),
      backButton: UIStore.backButton(),
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
    UIStore.listen(this._uiChanged.bind(this));

    if(this.state.user) {
      MessageActions.connect();
    }
  }

  componentWillUnmount() {
    UserStore.unlisten(this._userChanged.bind(this)); // This doesnt work!
    UIStore.listen(this._uiChanged.bind(this));
  }

  render() {
    const name = this.context.router.getCurrentPath();
    return (
      <div className="app vbox">
        <NavBar
          user={this.state.user}
          title={this.state.title}
          showBackButton={this.state.backButton} />
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

  _uiChanged() {
    this.setState({
      title: UIStore.title(),
      backButton: UIStore.backButton(),
    });
  }

  _curRouteClassName() {
    return 'page-' + this.context.router.getRouteAtDepth(1).name;
  }
}

const styles = StyleSheet.create({
  content: {
  },
});
