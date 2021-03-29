import React from "react";
import "./App.css";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { useAsync } from "react-async";

import { Loading, ErrorBox } from "./Utils";
import { AuthError, KratosFlow } from "./Kratos";
import { getUser } from "./user";
import { KRATOS_URI } from "./config";

const Header = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/settings/settings">Settings</Link>
        </li>
        <li>
          <Link to="/me">Me</Link>
        </li>
        <li>
          <Link to="/auth/recovery">Recovery</Link>
        </li>
        <li>
          <Link to="/auth/verify">Verify</Link>
        </li>
        <li>
          <Link to="/auth/login">Login</Link>
        </li>
        <li>
          <Link to="/auth/registration">Sign Up</Link>
        </li>
        <li>
          <Link to="/auth/logout">Log out</Link>
        </li>
      </ul>
    </nav>
  );
};

const App = () => {
  return (
    <Router>
      <div>
        <Header />
        <Switch>
          <Route path="/auth/error">
            <AuthError />
          </Route>
          <Route path="/auth/settings">
            <Settings />
          </Route>
          <Route path="/auth/recovery">
            <Recovery />
          </Route>
          <Route path="/auth/verify">
            <Verify />
          </Route>
          <Route path="/auth/login">
            <Login />
          </Route>
          <Route path="/auth/logout">
            <Logout />
          </Route>
          <Route path="/auth/registration">
            <Registration />
          </Route>
          <Route path="/me">
            <Me />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

const Logout = () => {
  window.location.href = `${KRATOS_URI}/self-service/browser/flows/logout`;
  return <Loading />;
};

const Registration = () => {
  return (
    <div>
      <h2>Sign up</h2>
      <KratosFlow flowType="registration" />
    </div>
  );
};

const Login = () => {
  return (
    <div>
      <h2>Login</h2>
      <KratosFlow flowType="login" />
    </div>
  );
};

const Settings = () => {
  return (
    <div>
      <h2>Settings</h2>
      <KratosFlow flowType="settings" />
    </div>
  );
};

const Recovery = () => {
  return (
    <div>
      <h2>Recovery</h2>
      <KratosFlow flowType="recovery" />
    </div>
  );
};

const Verify = () => {
  return (
    <div>
      <h2>Verify</h2>
      <KratosFlow flowType="verification" />
    </div>
  );
};

const Me = () => {
  const { data, error, isPending } = useAsync({ promiseFn: getUser });
  if (isPending) return <Loading />;
  if (error) return <ErrorBox />;
  return (
    <div>
      <h2>me</h2>
      <pre>{JSON.stringify(data, undefined, 2)}</pre>
    </div>
  );
};

const Home = () => {
  const { data, error, isPending } = useAsync({ promiseFn: getUser });
  if (isPending) return <Loading />;
  if (error) return <ErrorBox />;
  return (
    <div>
      <h2>Home</h2>
      {data ? <p> Hello {data.identity.traits.name.first}!</p> : null}
    </div>
  );
};

export default App;
