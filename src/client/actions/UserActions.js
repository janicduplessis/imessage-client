import state from '../state';
import ApiUtils from '../utils/ApiUtils';
import Storage from '../utils/Storage';

export default {
  async login(loginInfo) {
    try {
      let resp = await ApiUtils.login(loginInfo);
      this._setUserState(resp);
    } catch(err) {
      console.error(err);
    }
  },

  async register(registerInfo) {
    try {
      let resp = await ApiUtils.register(registerInfo);
      this._setUserState(resp);
    } catch(err) {
      console.error(err);
    }
  },

  _setUserState(resp) {
    if(resp.result === 'OK') {
      Storage.setItem('user', resp.user);
      state.set(['user'], {
        logged: true,
        model: resp.user,
        loading: false,
      });
    } else {
      Storage.setItem('user', null);
      state.set(['user'], {
        logged: false,
        model: null,
        loading: false,
      });
    }
  },
};
