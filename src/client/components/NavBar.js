import React from 'react';
import StyleSheet from 'react-style';
import {
  Paper,
  Toolbar,
  ToolbarGroup,
  ToolbarTitle,
  Tabs,
  Tab,
} from 'material-ui';

import colors from './colors';

class NavBar extends React.Component {
  render() {
    const user = this.props.user;
    const tabs = [];
    if(user === null) {
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
    const selected = tabs.findIndex(t => this.props.router.getCurrentPathname().indexOf(t.props.route) >= 0);
    return (
      <Paper zDepth={2} rounded={false}>
        <Toolbar style={styles.toolbar}>
          <ToolbarGroup style={styles.content}>
            <ToolbarTitle style={styles.title} text="iMessage Web"/>
            <Tabs style={styles.tabs} initialSelectedIndex={selected} tabWidth={150}>
              {tabs}
            </Tabs>
          </ToolbarGroup>
        </Toolbar>
      </Paper>
    );
  }

  _onActive(tab) {
    this.props.router.transitionTo(tab.props.route);
  }
}

NavBar.propTypes = {
  user: React.PropTypes.object,
  router: React.PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  toolbar: {
    backgroundColor: colors.primary,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },
  title: {
    color: colors.accent,
    flex: 1,
  },
  content: {
    display: 'flex',
    float: 'none',
    alignItems: 'flex-end',
    width: 800,
  },
  tabs: {
    height: '100%',
  },
});

export default NavBar;
