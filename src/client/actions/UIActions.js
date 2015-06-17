import { Flux, Actions } from '../flux';

class UIActions extends Actions {

  title(title) {
    return title;
  }

  backButton(visible) {
    return visible;
  }
}

export default Flux.createActions('ui', UIActions);
