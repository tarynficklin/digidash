import React, { Component } from 'react';
import AppTheme from './AppTheme'
import './App.css';


import Dashboard from './components/dashboard/Dashboard'

export default class App extends Component {

  render() {
    return (
      <div>
        <AppTheme />
        <div id="App">
          <Dashboard/>
        </div>
      </div>

    );
  }
}