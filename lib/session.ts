import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function getBusinessSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  return {
    id: session.user.id,
    email: session.user.email!,
    name: session.user.name!,
  };
}

export async function requireBusinessSession() {
  const session = await getBusinessSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
