import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

async function getBusinessSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  const user = session.user as any;
  return {
    id: user.id,
    email: user.email!,
    name: user.name!,
  };
}

export async function requireBusinessSession() {
  const session = await getBusinessSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
