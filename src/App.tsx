import React, { useEffect, useState } from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';


import Customer from '@/components/customer/index';
import UserLogin from '@/components/userLogin/index';

const App: React.FC<any> = () => {

  return (
    <HashRouter>
      <Switch>
        <Route path="/customer" component={Customer}/>
        <Route path="/" component={UserLogin}/>
      </Switch>
    </HashRouter>
  );
}

export default App;
