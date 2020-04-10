import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import Tasks from './Tasks';
import ContactList from './ContactList';
import Contact from './Contact';

function App() {
  return (
    <div className="App">
      <h1>CRM</h1>
      <Switch>
        <Route exact path={'/contacts/:id'} component={Contact} />} />
        <Route exact path="/contacts" component={ContactList} />} />
        <Route exact path="/tasks" component={Tasks} />} />
        <Redirect from="/" to="/tasks" />
      </Switch>
    </div>
  );
}

export default App;
