import React from 'react';
import { Route, Redirect } from 'react-router';
import AppHandler from './components/AppHandler';
import LoginHandler from './components/LoginHandler';
import ChatHandler from './components/ChatHandler';

export default (
  <Route name="app" path="/" handler={AppHandler}>
    <Route name="login" path="/login" handler={LoginHandler} />
    <Route name="chat" path="/chat" handler={ChatHandler} />
    <Redirect from="*" to="login" />
  </Route>
);
