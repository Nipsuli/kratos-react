import React from "react";
import { useFetch, useAsync, PromiseFn } from "react-async";
import { useLocation } from "react-router-dom";

import { Loading, ErrorBox } from "./Utils";
import { KRATOS_URI } from "./config";

const getError: PromiseFn<string> = async ({ errorId }) => {
  if (!errorId) return null;
  const res = await fetch(`${KRATOS_URI}/self-service/errors?error=${errorId}`);
  return res.json();
};

export const AuthError = () => {
  const loc = useLocation();
  const params = new URLSearchParams(loc.search);
  const errorId = params.get("error");
  const { data, error, isPending } = useAsync({ promiseFn: getError, errorId });
  let errorDetails = "";
  if (isPending) errorDetails = "Loading Error Details";
  if (error) errorDetails = "Un expected error";
  // MIGHT NOT BE THE BEST WAY IN PROD TO EXPOSE ERRORS TO USER
  if (data) errorDetails = JSON.stringify(data, undefined, 2);
  return (
    <div>
      <h2>Error</h2>
      <pre>{errorDetails}</pre>
    </div>
  );
};

// TODO:
// use '@oryd/kratos-client';
// improve form builder
// make the flow component to accept child component

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
  messages?: FieldMessage[];
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

const KratosForm = ({ action, method, fields, messages }: FormData) => {
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
        {!!messages
          ? messages.map((m, i) => <div key={i}>{m.text}</div>)
          : null}
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

type KratosFlowType =
  | "registration"
  | "login"
  | "settings"
  | "verification"
  | "recovery";

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
  // handle 410 response differently 
  console.log(data);
  // check expires_at from the data, after that the flow returbs returns 410 Gone
  // Should do some real checking on the data
  const d = data as {
    methods?: { [key: string]: { config: FormData; method: string } };
    messages?: { text: string }[];
  };
  const configs = Object.values(d?.methods || {});

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
      {!!d.messages
        ? d.messages.map((m, i) => <div key={i}>{m.text}</div>)
        : null}
    </div>
  );
};

export const KratosFlow = ({ flowType }: { flowType: KratosFlowType }) => {
  const flowId = useFlowId();
  if (!flowId) {
    window.location.href = `${KRATOS_URI}/self-service/${flowType}/browser`;
    return <Loading />;
  }

  return <KratosFlowForm flowId={flowId} flowType={flowType} />;
};
