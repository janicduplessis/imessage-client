import state from '../state';

export default {

  title(title) {
    state.set(['navbar', 'title'], title);
  },

  backButton(visible) {
    state.set(['navbar', 'backButton'], visible);
  },
};
