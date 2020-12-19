import React from 'react';
import { hydrate } from 'react-dom';
import App from './components/App';

const socket = window.__SOCKET__;
const state = {
  ...window.__STATE__,
  socket
};
delete window.__STATE__;
delete window.__SOCKET__;
hydrate(<App {...state} />, document.querySelector('#app'));
