import { fromJS } from 'immutable';
import { Flux, Store } from '../flux';
import UserActions from '../actions/UserActions';
import Storage from '../utils/Storage';

class UserStore extends Store {
  constructor() {
    super();

    this.register(UserActions.login, this._handleLogin);
    this.register(UserActions.register, this._handleLogin);

    let user = Storage.getItem('user');
    if(user) {
      user = fromJS(user);
    }

    this.state = {
      user: user,
      error: null,
    };
  }

  get() {
    return this.state.user;
  }

  _handleLogin(loginResp) {
    if(loginResp.result === 'OK') {
      Storage.setItem('user', loginResp.user);
      this.setState({
        user: fromJS(loginResp.user),
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
