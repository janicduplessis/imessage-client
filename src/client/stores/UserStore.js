import { Map } from 'immutable';
import { Flux, Store } from '../flux';
import UserActions from '../actions/UserActions';

class UserStore extends Store {
  constructor() {
    super();

    this.register(UserActions.login, this._handleLogin);
    this.register(UserActions.register, this._handleLogin);

    this.state = {
      user: null,
      error: null,
    };
  }

  get() {
    return this.state.user;
  }

  _handleLogin(loginResp) {
    if(loginResp.result === 'OK') {
      this.setState({
        user: new Map(loginResp.user),
        error: null,
      });
    } else {
      this.setState({
        user: null,
        error: loginResp.error,
      });
    }
  }
}

export default Flux.createStore('user', UserStore);
