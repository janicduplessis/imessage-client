import { Flux, Store } from '../flux';
import UIActions from '../actions/UIActions';

class UIStore extends Store {
  constructor() {
    super();

    this.register(UIActions.title, this._handleTitle);
    this.register(UIActions.backButton, this._handleBackButton);

    this.state = {
      title: '',
      backButton: false,
    };
  }

  title() {
    return this.state.title || 'iMessage Web';
  }

  backButton() {
    return this.state.backButton;
  }

  _handleTitle(title) {
    this.setState({title});
  }

  _handleBackButton(backButton) {
    this.setState({backButton});
  }
}

export default Flux.createStore('ui', UIStore);
