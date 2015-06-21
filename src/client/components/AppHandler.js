import React from 'react';
import StyleSheet from 'react-style';
import TransitionGroup from 'react/lib/ReactCSSTransitionGroup';
import ThemeManager from 'material-ui/lib/styles/theme-manager';
import {branch} from 'baobab-react/decorators';
import {RouteHandler} from 'react-router';

import NavBar from './NavBar';
import MessageActions from '../actions/MessageActions';
import colors from './colors';

import '../styles/app.scss';

@branch({
  cursors: {
    user: ['user'],
  },
})
export default class AppHandler extends React.Component {

  static childContextTypes = {
    muiTheme: React.PropTypes.object,
  }

  static contextTypes = {
    router: React.PropTypes.func,
  };

  constructor(props) {
    super(props);

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
    if(this.props.user) {
      MessageActions.connect();
    }
  }

  componentWillReceiveProps(props) {
    let {router} = this.context;
    let {user} = this.props;
    if(props.user !== user) {
      if(user) {
        MessageActions.connect();
        router.replaceWith('/chat');
      } else {
        router.replaceWith('/login');
      }
    }
  }

  render() {
    let name = this.context.router.getCurrentPath();
    return (
      <div className="app vbox">
        <NavBar />
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

  _curRouteClassName() {
    return 'page-' + this.context.router.getRouteAtDepth(1).name;
  }
}

const styles = StyleSheet.create({
  content: {
  },
});
