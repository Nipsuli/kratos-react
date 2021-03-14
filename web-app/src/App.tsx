import React from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { useFetch, useAsync } from "react-async";
// should be from some config object blaa blaa
const KRATOS_URI = "http://127.0.0.1:4433";

const Header = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/settings">Settings</Link>
        </li>
        <li>
          <Link to="/me">Me</Link>
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
          <Route path="/error">
            <Err />
          </Route>
          <Route path="/settings">
            <Settings />
          </Route>
          <Route path="/recovery">
            <Recovery />
          </Route>
          <Route path="/verify">
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

const Err = () => {
  return <h2>Error</h2>;
};

const Logout = () => {
  window.location.href = `${KRATOS_URI}/self-service/browser/flows/logout`;
  return <Loading />;
};

// Kratos form data
type FieldMessage = {
  context: { reason: string };
  id: number;
  text: string;
  type: "error"; // check other possibilities
};

type FormField = {
  name: string;
  type: string;
  required?: boolean;
  value?: string;
  messages?: FieldMessage[];
};

type FormData = {
  action: string;
  method: string;
  fields: FormField[];
};

// There got to be some better way to get thsi mapping
const fieldMap: Record<string, string> = {
  "traits.name.last": "Last name",
  "traits.name.first": "First name",
  "traits.email": "Email address",
  password: "Password",
  identifier: "Email address",
};

const getFieldName = (key: string): string => {
  return fieldMap[key] || key;
};

const KratosForm = ({ action, method, fields }: FormData) => {
  // "Simple" form generated automatically based on Kratos, endpoint data
  const [valState, setValState] = React.useState(
    Object.fromEntries(
      fields.filter((f) => !!f.value).map((f) => [f.name, f.value])
    )
  );
  const setFormValue = (k: string, v: string) => {
    if (k in valState) {
      setValState({ ...valState, [k]: v });
    }
  };
  return (
    <div>
      <form action={action} method={method}>
        {fields.map((f, i) => {
          const { name, type, required, messages } = f;
          return (
            <div key={i}>
              {type !== "hidden" ? (
                <label htmlFor={name}>{getFieldName(name)}:</label>
              ) : null}
              <input
                id={name}
                {...{ name, type, required, value: valState[name] }}
                onChange={(e) => setFormValue(name, e.target.value)}
              />
              {!!messages
                ? messages.map((m, i) => <label key={i}>{m.text}</label>)
                : null}
            </div>
          );
        })}
        <input type="submit" />
      </form>
    </div>
  );
};

const useFlowId = () => {
  const loc = useLocation();
  const params = new URLSearchParams(loc.search);
  return params.get("flow");
};

type KratosFlowType = "registration" | "login" | "settings";

const KratosFlowForm = ({
  flowId,
  flowType,
}: {
  flowId: string;
  flowType: KratosFlowType;
}) => {
  const headers = { Accept: "application/json" };
  const { data, error, isPending } = useFetch(
    `${KRATOS_URI}/self-service/${flowType}/flows?id=${flowId}`,
    {
      headers,
      credentials: "include",
    }
  );
  if (isPending) return <Loading />;
  if (error) return <ErrorBox />;
  // check expires_at from the data, after that the flow returbs returns 410 Gone
  // Should do some real checking on the data
  const d = data as {
    methods?: { [key: string]: { config: FormData; method: string } };
  };
  const configs = Object.values(d?.methods || {});
  console.log(configs);

  return (
    <div>
      {configs.map((c, i) => {
        return (
          <div key={i}>
            <h3>{c.method}</h3>
            <KratosForm {...c.config} />
          </div>
        );
      })}
    </div>
  );
};

const KratosFlow = ({ flowType }: { flowType: KratosFlowType }) => {
  const flowId = useFlowId();
  if (!flowId) {
    window.location.href = `${KRATOS_URI}/self-service/${flowType}/browser`;
    return <Loading />;
  }

  return <KratosFlowForm flowId={flowId} flowType={flowType} />;
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
  return <h2>Recovery</h2>;
};

const Verify = () => {
  return <h2>Verify</h2>;
};

const Loading = () => {
  return <h2>I'm a cool spinner for realz</h2>;
};

const ErrorBox = () => {
  return <h2>I'm a sad error</h2>;
};

// Not full user fields, but typing some of the fields for now
type UserIdentity = {
  id: string;
  traits: {
    name: {
      last: string;
      first: string;
    };
    email: string;
  };
};

type User = {
  id: string;
  identity: UserIdentity;
};

const getUser = async (): Promise<User | null> => {
  const headers = { Accept: "application/json" };
  const res = await fetch(`${KRATOS_URI}/sessions/whoami`, {
    headers,
    credentials: "include",
  });
  if (res.status === 200) return res.json();
  if (res.status === 401) return null;
  throw new Error("Failed to fetch user");
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
