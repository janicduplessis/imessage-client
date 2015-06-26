import React from 'react';
import StyleSheet from 'react-style';
import {
  TextField,
  RaisedButton,
} from 'material-ui';

import UserActions from '../actions/UserActions';

class RegisterHandler extends React.Component {
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
        <h1>Register</h1>
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
          <TextField
            floatingLabelText="Repeat password"
            type="password"
            value={this.state.passwordRepeat}
            onChange={this._passwordRepeatChanged.bind(this)} />
          <TextField
            floatingLabelText="First name"
            type="text"
            value={this.state.firstName}
            onChange={this._firstNameChanged.bind(this)} />
          <TextField
            floatingLabelText="Last name"
            type="text"
            value={this.state.lastName}
            onChange={this._lastNameChanged.bind(this)} />
          <RaisedButton style={styles.submit} primary={true} label="Register" type="submit" />
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

  _passwordRepeatChanged(event) {
    this.setState({ passwordRepeat: event.target.value });
  }

  _firstNameChanged(event) {
    this.setState({ firstName: event.target.value });
  }

  _lastNameChanged(event) {
    this.setState({ lastName: event.target.value });
  }

  _submit(event) {
    event.preventDefault();

    // Validation
    if(this.state.password !== this.state.passwordRepeat) {
      return;
    }

    UserActions.register({
      username: this.state.username,
      password: this.state.password,
      firstName: this.state.firstName,
      lastName: this.state.lastName,
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

export default RegisterHandler;
