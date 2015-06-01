import React from 'react';
import Router from 'react-router';
import routes from './routes';
import injectTapEventPlugin from 'react-tap-event-plugin';
import 'babel/polyfill';

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

Router.run(routes, (Handler) => {
  React.render(<Handler />, document.getElementById('content'));
});
