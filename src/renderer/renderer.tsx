/**
 * React renderer.
 */
// Import the styles here to process them with webpack
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '_public/style.css';
import App from '../components/App';
import '../scss/bootstrap.scss';

ReactDOM.render(
  <App />,
  document.getElementById('app'),
);
