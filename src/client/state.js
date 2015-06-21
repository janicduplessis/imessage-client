import Baobab from 'baobab';
import R from 'ramda';

import Storage from './utils/Storage';

let user = Storage.getItem('user');

export default new Baobab({
  // Authentication
  user: {
    logged: !!user,
    model: user || null,
    loading: false,
  },

  // App data
  convos: {
    models: {},
    loading: true,
  },
  messages: {
    models: {},
    loading: true,
  },

  // UI State
  navbar: {
    title: null,
    backButton: false,
  },

  currentConvoId: null,
},
{
  facets: {
    visibleMessages: {
      cursors: {
        id: ['currentConvoId'],
        messages: ['messages', 'models'],
      },
      get(state) {
        return state.id ?
          R.whereEq({convoId: state.id})(state.messages) : [];
      },
    },
  },
});
