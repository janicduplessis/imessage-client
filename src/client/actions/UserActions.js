import { Flux, Actions } from '../flux';
import ApiUtils from '../utils/ApiUtils';

class UserActions extends Actions {
  async login(username, password) {
    try {
      return await ApiUtils.login({username, password});
    } catch(error) {
      console.log(error);
      return null;
    }
  }
}

export default Flux.createActions('user', UserActions);
