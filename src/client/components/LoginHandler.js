import React from 'react';
import UserActions from '../actions/UserActions';

class LoginHandler extends React.Component {
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
          <button type="submit">Login</button>
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
    UserActions.login(this.state.username, this.state.password);
  }
}

export default LoginHandler;
