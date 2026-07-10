import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

type SessionUser = {
  id?: string;
  email?: string | null;
  name?: string | null;
};

export class AuthError extends Error {
  constructor() { super("Unauthorized"); this.name = "AuthError"; }
}

async function getBusinessSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  const user = session.user as SessionUser;
  if (!user.id || !user.email) {
    return null;
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name || user.email.split('@')[0],
  };
}

export async function requireBusinessSession() {
  const session = await getBusinessSession();
  if (!session) {
    throw new AuthError();
  }
  return session;
}
