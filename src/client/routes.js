import React from 'react';
import {Route, Redirect, DefaultRoute} from 'react-router';

import RootHandler from './handlers/RootHandler';
import LoginHandler from './handlers/LoginHandler';
import RegisterHandler from './handlers/RegisterHandler';
import AccountHandler from './handlers/AccountHandler';
import ChatHandler from './handlers/ChatHandler';
import MessagesHandler from './handlers/MessagesHandler';
import ConvosHandler from './handlers/ConvosHandler';

export default (
  <Route name="app" path="/" handler={RootHandler}>
    <Route name="login" path="/login" handler={LoginHandler} />
    <Route name="register" path="/register" handler={RegisterHandler} />
    <Route name="account" path="/account" handler={AccountHandler} />
    <Route name="chat" path="/chat" handler={ChatHandler}>
      <DefaultRoute name="convos" handler={ConvosHandler} />
      <Route name="convo" path="convo/:id" handler={MessagesHandler} />
    </Route>
    <Redirect from="*" to="login" />
  </Route>
);
