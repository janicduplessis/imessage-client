import { Flux, Actions } from '../flux';
import ApiUtils from '../utils/ApiUtils';

class UserActions extends Actions {
  async login(loginInfo) {
    try {
      return await ApiUtils.login(loginInfo);
    } catch(err) {
      console.error(err);
    }
  }

  async register(registerInfo) {
    try {
      return await ApiUtils.register(registerInfo);
    } catch(err) {
      console.error(err);
    }
  }
}

export default Flux.createActions('user', UserActions);
