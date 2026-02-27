import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

type SessionUser = {
  id?: string;
  email?: string | null;
  name?: string | null;
};

async function getBusinessSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  const user = session.user as SessionUser;
  if (!user.id || !user.email || !user.name) {
    return null;
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

export async function requireBusinessSession() {
  const session = await getBusinessSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
