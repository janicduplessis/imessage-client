import React from 'react';
import { Route, Redirect } from 'react-router';
import AppHandler from './components/AppHandler';
import LoginHandler from './components/LoginHandler';
import RegisterHandler from './components/RegisterHandler';
import LogoutHandler from './components/LogoutHandler';
import ChatHandler from './components/ChatHandler';

export default (
  <Route name="app" path="/" handler={AppHandler}>
    <Route name="login" path="/login" handler={LoginHandler} />
    <Route name="register" path="/register" handler={RegisterHandler} />
    <Route name="logout" path="/logout" handler={LogoutHandler} />
    <Route name="chat" path="/chat" handler={ChatHandler} />
    <Redirect from="*" to="login" />
  </Route>
);
