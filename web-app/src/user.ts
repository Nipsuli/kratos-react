import { KRATOS_URI } from "./config";
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

export const getUser = async (): Promise<User | null> => {
  const headers = { Accept: "application/json" };
  const res = await fetch(`${KRATOS_URI}/sessions/whoami`, {
    headers,
    credentials: "include",
  });
  if (res.status === 200) return res.json();
  if (res.status === 401) return null;
  throw new Error("Failed to fetch user");
};
