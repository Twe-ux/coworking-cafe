import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { ProfileClient } from "./ProfileClient";

export const metadata = {
  title: "Mon Profil | Admin",
  description: "Gérer mon profil et modifier mon code PIN",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return <ProfileClient user={session.user} />;
}
