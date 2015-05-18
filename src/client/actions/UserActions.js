import { Flux, Actions } from '../flux';
import ApiUtils from '../utils/ApiUtils';

class UserActions extends Actions {
  async login(loginInfo) {
    try {
      return await ApiUtils.login(loginInfo);
    } catch(error) {
      console.log(error);
    }
  }

  async register(registerInfo) {
    try {
      return await ApiUtils.register(registerInfo);
    } catch(error) {
      console.log(error);
    }
  }
}

export default Flux.createActions('user', UserActions);
