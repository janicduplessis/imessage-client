import React from 'react';
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
        <form onSubmit={this._submit.bind(this)}>
          <input
            placeholder="Username"
            type="text"
            value={this.state.username}
            onChange={this._usernameChanged.bind(this)} />
          <input
            placeholder="Password"
            type="password"
            value={this.state.password}
            onChange={this._passwordChanged.bind(this)} />
          <input
            placeholder="Repeat password"
            type="password"
            value={this.state.passwordRepeat}
            onChange={this._passwordRepeatChanged.bind(this)} />
          <input
            placeholder="First name"
            type="text"
            value={this.state.firstName}
            onChange={this._firstNameChanged.bind(this)} />
          <input
            placeholder="Last name"
            type="text"
            value={this.state.lastName}
            onChange={this._lastNameChanged.bind(this)} />
          <button type="submit">Register</button>
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

export default RegisterHandler;
