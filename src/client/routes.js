import React from 'react';
import {Route, Redirect, DefaultRoute} from 'react-router';
import Root from './components/Root';
import LoginHandler from './components/LoginHandler';
import RegisterHandler from './components/RegisterHandler';
import AccountHandler from './components/AccountHandler';
import ChatHandler from './components/ChatHandler';
import MessagesHandler from './components/MessagesHandler';
import ConvosHandler from './components/ConvosHandler';

export default (
  <Route name="app" path="/" handler={Root}>
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
