import React from 'react';
import StyleSheet from 'react-style';
import {
  TextField,
  RaisedButton,
} from 'material-ui';

import UserActions from '../actions/UserActions';

export default class LoginHandler extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
    };
  }

  render() {
    return (
      <div>
        <h1>Login</h1>
        <form style={styles.form} onSubmit={this._submit.bind(this)}>
          <TextField
            floatingLabelText="Username"
            type="text"
            value={this.state.username}
            onChange={this._usernameChanged.bind(this)} />
          <TextField
            floatingLabelText="Password"
            type="password"
            value={this.state.password}
            onChange={this._passwordChanged.bind(this)} />
          <RaisedButton style={styles.submit} label="Login" primary={true} type="submit" />
        </form>
      </div>
    );
  }

  _usernameChanged(event) {
    this.setState({ username: event.target.value });
  }

  _passwordChanged(event) {
    this.setState({ password: event.target.value });
  }

  _submit(event) {
    event.preventDefault();
    UserActions.login({
      username: this.state.username,
      password: this.state.password,
    });
  }
}

const styles = StyleSheet.create({
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  submit: {
    marginTop: 32,
  },
});
