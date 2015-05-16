import { Flummox, Store, Actions} from 'flummox';

class BaseStore extends Store {
  listen(fn) {
    this.addListener('change', fn);
  }

  unlisten(fn) {
    this.removeListener('change', fn);
  }
}

export default {
  Flux: new Flummox(),
  Store: BaseStore,
  Actions: Actions,
};
