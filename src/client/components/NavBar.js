import React from 'react';
import StyleSheet from 'react-style';
import {
  Paper,
  IconButton,
  Toolbar,
  ToolbarGroup,
  ToolbarTitle,
  Tabs,
  Tab,
} from 'material-ui';
import {branch} from 'baobab-react/decorators';

import colors from './colors';

@branch({
  cursors: {
    user: ['user', 'model'],
    navbar: ['navbar'],
  },
})
export default class NavBar extends React.Component {

  static contextTypes = {
    router: React.PropTypes.func.isRequired,
  };

  render() {
    let user = this.props.user;
    let tabs = [];
    if(!user) {
      tabs.push(
        <Tab
          key="10"
          label="Login"
          route="login"
          onActive={this._onActive.bind(this)} />
      );
      tabs.push(
        <Tab
          key="20"
          label="Register"
          route="register"
          onActive={this._onActive.bind(this)} />
      );
    } else {
      tabs.push(
        <Tab
          key="30"
          label="Chat"
          route="chat"
          onActive={this._onActive.bind(this)} />
      );
      tabs.push(
        <Tab
          key="40"
          label="Account"
          route="account"
          onActive={this._onActive.bind(this)} />
      );
    }

    let selected = tabs.findIndex(t => this.context.router.getCurrentPathname().indexOf(t.props.route) >= 0);
    let backButton = this.props.navbar.backButton ? (
      <IconButton
        style={styles.backButton}
        iconStyle={styles.backIcon}
        iconClassName="material-icons back-icon"
        onClick={this._onBack.bind(this)} />
    ) : <div />; // can use null when my pull request is merged.

    return (
      <Paper zDepth={2} rounded={false}>
        <Toolbar style={styles.toolbar}>
          <ToolbarGroup style={styles.content}>
            {backButton}
            <ToolbarTitle style={styles.title} text={this.props.navbar.title || 'iMessage Web'} />
            <Tabs style={styles.tabs} initialSelectedIndex={selected} tabWidth={150}>
              {tabs}
            </Tabs>
          </ToolbarGroup>
        </Toolbar>
      </Paper>
    );
  }

  _onActive(tab) {
    this.context.router.transitionTo(tab.props.route);
  }

  _onBack() {
    this.context.router.goBack();
  }
}

const styles = StyleSheet.create({
  toolbar: {
    backgroundColor: colors.primary,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    paddingLeft: 0,
  },
  title: {
    color: colors.accent,
    flex: 1,
  },
  content: {
    display: 'flex',
    float: 'none',
    alignItems: 'flex-end',
    width: '100%',
  },
  '@media screen and (min-width: 800px)': {
    content: {
      width: 800,
    },
  },
  tabs: {
    height: '100%',
  },
  backButton: {
    alignSelf: 'center',
  },
  backIcon: {
    color: colors.accent,
  },
});
