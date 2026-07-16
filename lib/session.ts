import { getServerSession } from "next-auth/next";

type SessionUser = {
  id?: string;
  email?: string | null;
  name?: string | null;
};

export class AuthError extends Error {
  constructor() { super("Unauthorized"); this.name = "AuthError"; }
}

async function getBusinessSession() {
  const { authOptions } = await import("./auth");
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
  if (process.env.TEST_MODE === 'true' && process.env.TEST_USER_ID) {
    return {
      id: process.env.TEST_USER_ID,
      email: 'test@billforge.local',
      name: 'Test Business',
    };
  }
  const session = await getBusinessSession();
  if (!session) {
    throw new AuthError();
  }
  return session;
}
